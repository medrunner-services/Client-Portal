# Medrunner Client Portal

This portal brings the medrunner experience to the web!

## Delivery and versioning

See [deployment setup and migration](docs/deployment.md) for Cloudflare Pages delivery, environment values, and semantic-release versioning. Production `release/stable` keeps npm; staging `main` uses pnpm.

## Project Setup

```sh
pnpm install
pnpm run dev
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to contribute to the project and the process for submitting pull requests to us.

## Planning Changes (OpenSpec)

Non-trivial changes are planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec) before
implementation. Each change lives in `openspec/changes/<name>/` (proposal, spec deltas, design,
tasks) and is reviewed before any code is written; once shipped it is archived and its deltas are
merged into `openspec/specs/`.

- Claude Code: `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive`
  (commands in `.claude/commands/opsx/`, skills in `.claude/skills/openspec-*`).
- Codex and other `AGENTS.md` tools: the `openspec-*` skills in `.agents/skills/`.
- CLI: `npm install -g @fission-ai/openspec`, then `openspec list` / `openspec validate`.
  Regenerate the agent files after a CLI upgrade with `openspec update`.

Small, obvious changes need no proposal.
