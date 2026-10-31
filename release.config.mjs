/** @type {import("semantic-release").GlobalConfig} */
import { execFileSync } from "node:child_process";

// Repository policy for release/+([0-9])?(.{+([0-9]),x}).x.
// Prefixed maintenance names need explicit SemVer ranges.
const maintenance = execFileSync("git", ["for-each-ref", "--format=%(refname:strip=3)", "refs/remotes/origin/"], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(name => /^release\/(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))?\.x$/.test(name))
    .map(name => ({ name, range: name.slice("release/".length), channel: `maintenance-${name.slice("release/".length)}` }));

export default {
    branches: [
        ...maintenance,
        { name: "release/stable", channel: "stable" },
        { name: "release/rc", channel: "rc", prerelease: "rc" },
        { name: "main", channel: "preview", prerelease: "dev" },
        { name: "ci", channel: "ci", prerelease: "ci-do-not-use" },
    ],
    tagFormat: "v${version}", // eslint-disable-line no-template-curly-in-string -- semantic-release substitutes this placeholder.
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/github",
    ],
};
