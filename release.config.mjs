/** @type {import('semantic-release').GlobalConfig} */
export default {
    branches: [
        { name: "release/stable", channel: "stable" },
        { name: "main", channel: "dev", prerelease: "dev" },
    ],
    tagFormat: "v${version}",
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/github",
    ],
};
