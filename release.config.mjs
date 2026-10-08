/** @type {import('semantic-release').GlobalConfig} */
export default {
    branches: [
        { name: "release/stable", channel: "stable" },
        { name: "main", channel: "staging", prerelease: "dev" },
    ],
    tagFormat: "v${version}", // eslint-disable-line no-template-curly-in-string -- semantic-release substitutes this placeholder.
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/github",
    ],
};
