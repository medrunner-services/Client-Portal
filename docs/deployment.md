# Client Portal delivery

The portal deploys independently through `medrunner-services/ci`. Its GitHub workflow owns the branch policy, public configuration mapping, and API notification; `wrangler.json` owns the Pages project name and `dist` output. All delivery operations live in GHA. Cloudflare projects and domains are configured once through the dashboard/CLI.

## Pipeline

| Event | Behavior |
| --- | --- |
| PR targeting `main` or `release/stable` | Frozen dependency install, check (lint + types), and build. Staging also runs its regression tests. No release or deployment. |
| Push to `main` after merge | Semantic prerelease when required, then build and deploy to staging. |
| Push to `release/stable` after merge | Semantic stable release when required, then build and deploy to production. |

The caller reuses `wf-test-node.yml`, `wf-release-semantic.yml`, and `wf-deploy-cloudflare-pages.yml`. There are no feature-branch uploads, dynamic callbacks, artifact handoffs, or Terraform jobs.

`release/stable` starts from the previous production `main` (`39baad7`) and keeps npm, `package-lock.json`, application version `2.9.3`, and the production dependency versions. The shared workflows support npm, so adopting delivery does not require upgrading the app. Production currently has no automated test suite; its caller explicitly disables the test step while retaining lint, type checks, and builds. `main` receives the reconciled development history and keeps pnpm and its regression suite. Never copy the development package manifest or pnpm lockfile into production just to enable deployment.

Review and passing PR validation are the delivery gate. Preserve existing branch protections and configure required validation checks according to the repository's policy. A successful merge triggers deployment without GitHub environment approvals or wait timers. Keep `release`, `deploy-cf-staging`, and `deploy-cf-production` free of those gates; these environments select configuration. No `deploy-cf-preview` environment is used.

`release.config.mjs` uses Conventional Commits: `fix:` publishes a patch, `feat:` a minor, and breaking changes a major. Stable tags are `vX.Y.Z`; staging tags are `vX.Y.Z-dev.N`. A new release is built from its generated tag and version. Merges without a new release still deploy the merged commit, using its nearest reachable release tag (production excludes prereleases), or package.json if no tag exists. Versions are stamped locally after the frozen install, with no source version commits or lockfile changes.

Reconcile stable release history back into `main` through a manual PR. Automatic backpropagation is disabled because this repository currently disallows Actions PR creation; a failed automation step must not prevent production deployment. If enabling this optional behavior later, first allow Actions PR creation in repository settings, then set `enable-backpropagation` to `true` in the caller. Approval/auto-merge remain disabled. Push runs finish without automatic cancellation; superseded PR runs are cancelled. To retry, rerun the failed Actions run/jobs.

## GitHub configuration

Create `deploy-cf-production`, `deploy-cf-staging`, and `release` in this repository. Use **unsuffixed names**, with differing values stored in the corresponding deployment environment. Identical values may be repository/organization variables. Environments do not inherit from each other.

| Variable | Value |
| --- | --- |
| `API_URL` | Target HTTPS API base URL. |
| `CALLBACK_URL` | Target portal origin without the auth path: `https://portal.medrunner.space` or `https://portal.medrunner.dev`. |
| `DISCORD_CLIENT_ID` | Public Discord OAuth application ID. |
| `DISCORD_SERVER_ID` | Discord server ID. |
| `ENABLE_APM` | Staging only; optional `true`/`false`; empty disables monitoring. |
| `APM_SERVER_URL` | Staging only; required when APM is enabled. |
| `POSTHOG_TOKEN` | Optional public browser ingestion key, never an administration token. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID; a shared repository variable is sufficient. |

| Environment secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Account-scoped Cloudflare Pages Edit token. The existing repository secret can be shared; environment secrets may override it. |
| `AUTOMATION_DEPLOY` | Optional target API notification credential, configured in each deployment environment. During migration, the caller falls back to the matching existing `AUTOMATION_DEPLOY_PROD` or `AUTOMATION_DEPLOY_DEV` repository secret. |

Build variables resolve inside the selected deployment runner. All frontend `VITE_*` values become public; OAuth client secrets and private credentials must never be frontend inputs. The deployment call uses `secrets: inherit` so repository and environment credentials reach the reusable workflow; an environment secret overrides a repository secret with the same name. GitHub requires the caller to pass credentials even when the called workflow selects an environment. The `release` environment needs no manually configured GitHub token. Check available environment features in the repository settings.

Client uses public npm packages and disables private registry authentication.

The API notification runs after a successful upload, using client ID `1` and the actual build version. Missing notification credentials skip it; failures are best-effort. The existing endpoint uses query authentication, so no credential-bearing URL or response body is logged.

## Cloudflare setup

Use one environment-neutral Pages project for this portal: `medrunner-portal-client`. Its production branch is `release/stable`; `main` is the fixed staging deployment alias. Cloudflare calls staging a preview deployment, but this pipeline only uses the two delivery branches. The project name identifies the application; deployment branches identify its environments.

Changing `wrangler.json` does not rename an existing Cloudflare project. Cloudflare does not support changing an existing `pages.dev` hostname in place. When migrating from `client-portal-prod` or `medrunner-client-portal-dev`, create the neutrally named project, verify each environment's deployment, then move its custom domain and DNS. Keep the old projects available until the cutover is complete.

1. **Create or reuse `medrunner-portal-client`.** For a new project, choose Direct Upload rather than Git integration. From an authenticated CLI:
   ```sh
   npx wrangler@4.148.0 pages project create medrunner-portal-client
   ```
   Select `release/stable` as production branch when prompted. The project name must match `wrangler.json`. Confirm the actual `pages.dev` hostname if Cloudflare adds a suffix.
2. **Set the production branch to `release/stable`.** Existing Git-connected projects expose branch controls in the dashboard. For an existing Direct Upload project, Cloudflare requires a one-time API update. With the account ID/token in local environment variables:
   ```powershell
   Invoke-RestMethod -Method Patch `
     -Uri "https://api.cloudflare.com/client/v4/accounts/$env:CLOUDFLARE_ACCOUNT_ID/pages/projects/medrunner-portal-client" `
     -Headers @{ Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN" } `
     -ContentType "application/json" -Body '{"production_branch":"release/stable"}' |
     Select-Object success
   ```
3. **Disable Cloudflare's automatic Git builds** for an existing Git-connected project: in Build / Branch control, turn off automatic production deployments and set automatic preview branches to None. Wrangler uploads continue working. A new Direct Upload project needs no Cloudflare build command, package installation, or build variables.
4. **Create the deployment token:** Account → Cloudflare Pages → Edit, limited to the intended account. Put it in GitHub as `CLOUDFLARE_API_TOKEN`; put the account ID in the `CLOUDFLARE_ACCOUNT_ID` variable.
5. **Preserve production before changing `main`.** Create `release/stable` from the audited previous production `main`, land the npm-compatible deployment backport there, and verify its upload at the Pages hostname before moving the production domain. Then merge the development history into `main` with reviewed conflict resolutions. Keep `main`'s pnpm setup and tests, and remove the superseded production-on-main workflow.
6. **Configure custom domains in the Pages project's Custom domains tab**, then configure proxied DNS:
   | Domain | CNAME target |
   | --- | --- |
   | `portal.medrunner.space` | `medrunner-portal-client.pages.dev` |
   | `portal.medrunner.dev` | `main.medrunner-portal-client.pages.dev` |
   Attach each domain only after verifying its corresponding upload. Add each domain in Pages before changing DNS. For staging, change the created CNAME to the branch alias after domain activation. Branch custom domains require Cloudflare-proxied DNS. If a domain is currently attached to an old project, remove that association when ready for its cutover and add it to the new project.
7. **Configure login for the fixed domains.** Register the `/auth` and `/auth/register` redirect paths under the configured `CALLBACK_URL`, and allow the corresponding origin in the target API's CORS policy. No per-PR registrations are needed.
8. **Verify staging** after merging into `main`, checking its build version and assets at `https://main.medrunner-portal-client.pages.dev`. OAuth returns to the configured `CALLBACK_URL`, so verify login at `https://portal.medrunner.dev` after its domain cutover. Verify production login at `https://portal.medrunner.space` after its cutover. Routine production releases later merge approved changes from `main` into `release/stable`; production hotfixes branch from `release/stable` and are reconciled back into `main`. Verify each custom domain and login before retiring the old projects.

Official instructions: [Direct Upload and production branch setup](https://developers.cloudflare.com/pages/get-started/direct-upload/), [GHA token setup](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [disable automatic Git builds](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments), [branch custom domains](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/), and [hostname limitations](https://developers.cloudflare.com/pages/platform/known-issues/).

## Rollout and local checks

The shared workflows are available at `medrunner-services/ci@v1`. Establish both delivery branches and required PR checks, configure GitHub values and Cloudflare as above, and land this repository's workflow, release config, Wrangler config, and docs through PRs.

Audit the release baseline before enabling semantic-release. If previous releases lack tags, tag the last genuine released version at its audited released commit. package.json alone does not establish semantic-release history; without a baseline, semantic-release starts from its initial version. The migration baseline is `v2.9.3` at the audited production commit `39baad7`, verified against the original live Pages deployment. Routine releases are published by the workflow.

Move old `*_PROD`/`*_DEV` public variables to the two deployment environments without suffixes. Move the account ID and browser PostHog key from secrets to variables. Use the credential source or rotate secrets; existing secret values cannot be read back. Remove old configuration only after checking remaining consumers.

Production (`release/stable`):

```sh
npm ci
npm run check
npm run build
npm run build:staging
```

Staging (`main`):

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm build:staging
```

Local checks do not release or deploy. Validate the workflow with actionlint.
