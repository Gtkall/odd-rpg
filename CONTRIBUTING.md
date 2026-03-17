# Contributing

## Branches

- `main` — stable, release-ready. Every push triggers the release pipeline.
- `develop` — active development. Open PRs against this branch.

Merge `develop` → `main` when ready to ship.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Commit messages drive automatic versioning — write them accurately.

```
<type>(<optional scope>): <description>

[optional body]

[optional footer — BREAKING CHANGE: <description>]
```

Common types:

| Type | Use for | Triggers release |
|---|---|---|
| `feat` | New player-facing feature | minor |
| `fix` | Bug fix | patch |
| `refactor` | Code change with no behaviour change | none |
| `chore` | Tooling, dependencies, config | none |
| `docs` | Documentation only | none |
| `style` | Formatting, CSS tweaks | none |
| `perf` | Performance improvement | none |
| `test` | Tests only | none |

A `BREAKING CHANGE:` footer on any commit type triggers a **major** bump.

## Releasing

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/semantic-release/). There is no manual tagging or version bumping.

When `main` receives a push, the release workflow:

1. Analyses all commits since the last tag
2. Determines the next semver version from commit types
3. Updates `package.json` and `system.json`
4. Writes/updates `CHANGELOG.md`
5. Creates a `v{version}` git tag and GitHub Release
6. Builds the project and attaches `system.json` + `odd-rpg.zip` as release artifacts
7. Commits the version bump back to `main` (`chore(release): x.y.z [skip ci]`)

If no releasable commits are present, no release is created.

> **Do not** manually edit `version` in `system.json` or `package.json`, create `v*` tags, or write `CHANGELOG.md` entries — these are all owned by the release pipeline.

## One-time GitHub setup

**Settings → Actions → General → Workflow permissions → Read and write permissions**

Required for the release workflow to push the version bump commit back to `main`.
