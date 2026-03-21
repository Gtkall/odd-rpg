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
    // Bumps package.json version; npmPublish: false skips the npm registry
    ["@semantic-release/npm", { npmPublish: false }],
    [
      "@semantic-release/exec",
      {
        // Runs after npm version bump — updates system.json, syncs lock file, builds ZIP
        prepareCmd: "node scripts/prepare-release.mjs ${nextRelease.version}",
      },
    ],
    // Commits CHANGELOG.md, package.json, system.json back to main
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json", "system.json"],
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
