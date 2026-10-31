/** @type {import('semantic-release').GlobalConfig} */
export default {
    // The shared standard-branches resolver expands prefixed maintenance branches with explicit ranges.
    branches: [
        'release/+([0-9])?(.{+([0-9]),x}).x',
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
