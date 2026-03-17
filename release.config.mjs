/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      { preset: "conventionalcommits" },
    ],
    [
      "@semantic-release/release-notes-generator",
      { preset: "conventionalcommits" },
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/exec",
      {
        // Runs after version is determined — updates system.json, builds ZIP
        prepareCmd: "node scripts/prepare-release.mjs ${nextRelease.version}",
      },
    ],
    // Bumps package.json version; npmPublish: false skips the npm registry
    ["@semantic-release/npm", { npmPublish: false }],
    // Commits CHANGELOG.md, package.json, system.json back to main
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "system.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
    // Creates the GitHub Release and attaches artifacts
    [
      "@semantic-release/github",
      {
        assets: [
          { path: "dist/system.json", label: "system.json" },
          { path: "odd-rpg.zip",      label: "odd-rpg.zip" },
        ],
      },
    ],
  ],
};
