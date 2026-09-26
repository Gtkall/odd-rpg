# Steering Foundry VTT system development (odd-rpg): extensibility, version compatibility, low-cost feature work (as of Sept 2026)

Research note on method: foundryvtt.com and foundryvtt.wiki were **blocked by the sandbox egress proxy** (fetches returned EGRESS_BLOCKED), so claims sourced to those domains come from search-engine snippets of the pages, not full-page reads. GitHub pages were fetched in full where cited. Local repo checks (2026-09-23): `system.json` has `compatibility: {minimum: 13, verified: 13}`, **no `flags.hotReload`**, **no `packs`**, and `src/`/`templates/` contain no uses of `ActiveEffect`, `MeasuredTemplate`, `ACTIVE_EFFECT_MODES`, `_insertElement` or `<details>` (grep). So odd-rpg's exposure to v14 breaking changes is currently small.

## 1. Foundry versioning, deprecation policy, v13 -> v14 status and breaking changes, manifest compatibility

### Takeaway
Version 14 has been Stable since April 2026 (14.359, then patch builds up to at least 14.368), and a v13-only system is now one major version behind. Foundry keeps public-API deprecations for about two major versions: V11-era deprecations were removed in V13, and several things deprecated in v14 are scheduled for removal in v16. odd-rpg should move to `minimum: 13, verified: 14` (or go v14-only), deal with the few v14 changes that matter to a sheet-heavy system (Active Effects v2, ApplicationV2/Handlebars rendering changes, manifest fields), and never set `maximum` unless it knows of an actual incompatibility, because Foundry enforces `maximum` strictly.

### Cited Findings
- **v14 Stable 1 = build 14.359, released April 1, 2026.** The release was kept small on purpose to lock down the platform — [Foundry release 14.359 (search snippet)](https://foundryvtt.com/releases/14.359); the felddy docker "v14 Stable Release" discussion dates the image release April 3, 2026 — [felddy/foundryvtt-docker #1385](https://github.com/felddy/foundryvtt-docker/discussions/1385).
- Later v14 stable patch builds exist: 14.360, 14.362, 14.364, 14.365, 14.368 — [14.360](https://foundryvtt.com/releases/14.360), [14.364](https://foundryvtt.com/releases/14.364), [14.365](https://foundryvtt.com/releases/14.365), [14.368](https://foundryvtt.com/releases/14.368). A community PR already targets "Foundry 14.368 / dnd5e 6.0.3" — [sw5e-module PR #77](https://github.com/sw5e-foundry/sw5e-module/pull/77).
- 14.359 behavior changes: the default Level top elevation is now 4 × grid distance, the camera no longer auto-centers on a token when its level changes, the default visibility of measured template regions changed from OBSERVER to ALWAYS, and the Placeables tab shows only the active level — [14.359 (search snippet)](https://foundryvtt.com/releases/14.359). `PlaceablesLayer.SORT_ORDER` was removed and an experimental Particle Generator API was added — [14.360 (snippet)](https://foundryvtt.com/releases/14.360).
- **Version 15:** a search snippet from Foundry's "Year in Review 2026" says work on V15 had not begun at that time and the team was focusing on quality-of-life improvements first — [Year in Review 2026](https://foundryvtt.com/article/year-in-review-2026/). I found no V15 prototype release notes as of Sept 2026 (see Gaps).
- **Deprecation window.** Foundry issue #11815 "Enact final deprecations to remove backwards compatible support for changes in V11 or prior which have reached the end of their deprecation period", milestone "V13 Prototype 2 – 13.333" — [foundryvtt#11815](https://github.com/foundryvtt/foundryvtt/issues/11815). An earlier issue did the same for V10-and-earlier changes — [foundryvtt#10164](https://github.com/foundryvtt/foundryvtt/issues/10164). A third-party v14 migration guide lists several v14 deprecations "for future removal (v16)": AppV1 `Application`/`Dialog`/`FormApplication`/`DocumentSheet`, the `minimumCoreVersion`/`compatibleCoreVersion` and `dependencies` manifest fields, and `MeasuredTemplateDocument` — [vagabond FOUNDRY_V14_MIGRATION.md](https://github.com/mordachai/vagabond/blob/main/FOUNDRY_V14_MIGRATION.md) (community source, not official).
- **Private API:** Foundry gives no deprecation period or compatibility layer for private methods (the `_`-prefixed ones) and may break them at any time, even during Stable — [Foundry API Migration Guides (search snippet)](https://foundryvtt.com/article/migration/).
- `CONFIG.debug.compatibility` takes a level from `CONST.COMPATIBILITY_MODES` (SILENT through FAILURE) and controls how loudly deprecation warnings are logged — [Foundry API migration article / search snippet](https://foundryvtt.com/article/migration/). This lets a dev or test world raise deprecations to errors.
- **v13 -> v14 changes relevant to a game system** (from the community guide, which cites core API names; check against the official 14.x notes). All are from [vagabond FOUNDRY_V14_MIGRATION.md](https://github.com/mordachai/vagabond/blob/main/FOUNDRY_V14_MIGRATION.md):
  - Active Effects v2: `ActiveEffect#changes` moved to `ActiveEffect#system.changes`. The numeric change `mode` became a string `type` (`"add"`, `"multiply"`, `"override"` …), and `CONST.ACTIVE_EFFECT_MODES` became `CONST.ACTIVE_EFFECT_CHANGE_TYPES` with different numeric values ("Old ADD=2 now add=20"). `origin` is now a `DocumentUUIDField`. `CONFIG.ActiveEffect.legacyTransferral` was removed. **A `prepareBaseData()` override that does not call `super.prepareBaseData()` leaves `_completedActiveEffectPhases` unreset**, which breaks later updates. Two other PRs confirm the mode→type migration: [Fabula Ultima PR #1367](https://github.com/League-of-Fabulous-Developers/FoundryVTT-Fabula-Ultima/pull/1367) and [sla-foundry PR #333](https://github.com/VacantFanatic/sla-foundry/pull/333).
  - Other AE additions: change "phases" for control over when data is prepared, durations based on combat, turn or round events, and ActiveEffect as a primary document that can be stored in compendiums — [search summary of Foundry 14.35x notes / wiki AE primer](https://foundryvtt.wiki/en/development/guides/active-effects).
  - ApplicationV2: `_insertElement` is now `async _insertElement(element, options)`. `<menu class="controls-dropdown">` was removed from the frame template. Detach/attach window controls are on by default. A new `prerender` event and a `preRenderApplication` hook were added.
  - HandlebarsApplicationMixin: `_replaceHTML` now works in two passes (collect prior state, then replace). **`<details>` elements need a `data-sync` attribute to keep their open/closed state across renders.**
  - MeasuredTemplate documents were removed in favor of Regions. Scene Levels were added (new `Level` embedded document, new token `level`/`depth` fields). `token.detectionModes` is now a `TypedObjectField` instead of an array.
  - Data update operators: the special string keys `"-=key"`/`"==key"` are deprecated in favor of `DataFieldOperator`.
  - TinyMCE was removed; ProseMirror is the only editor.
  - `CHAT_MESSAGE_TYPES` became `CHAT_MESSAGE_STYLES`.
  - Manifest: `minimumCoreVersion`/`compatibleCoreVersion` are deprecated (use `compatibility`), and "`maximum: 13` refuses to load in v14" (a hard block).
- The felddy docker image now publishes mainly to `ghcr.io/felddy/foundryvtt`, with Docker Hub as a mirror. The v14 images moved to Node 24 and dropped ARMv7 — [felddy #1385](https://github.com/felddy/foundryvtt-docker/discussions/1385).

### Inferences
- **Recommended compatibility policy for odd-rpg:** on the main branch, target the current Stable generation (v14) with `compatibility: {minimum: 13, verified: 14}` for one release cycle, then raise `minimum` to 14 when you want v14-only APIs such as AE phases, DataFieldOperator or AE-in-compendium. Leave `maximum` unset, since it is a hard block. When a v15 Testing build appears, run CI against it and bump `verified` only after it passes. If a v13 maintenance line is needed, keep a `release/13.x` branch, the same way dnd5e keeps `N.x` branches (branches 3.1.x, 4.1.x, 5.3.x are visible at [dnd5e repo](https://github.com/foundryvtt/dnd5e/blob/5.3.x/dnd5e.mjs)).
- Given the roughly two-major deprecation window, a system that clears deprecation warnings every major (with `CONFIG.debug.compatibility` set to FAILURE in dev and test) will never be caught by removals.
- Current risk for odd-rpg: low. There is no AE code, no MeasuredTemplate, and no `<details>`. The main v14 items to check are (a) custom ApplicationV2 subclasses that override `_insertElement`, `_replaceHTML` or frame rendering (the custom initiative tracker), (b) any `prepareBaseData` override that skips `super`, and (c) new work written with v14 AE shapes (`system.changes`, string `type`) from the start.
- Only public APIs should be touched. Put any use of `_private` methods in one "compat" module so it is easy to audit on each Foundry bump.

### Gaps
- Could not read foundryvtt.com/article/versioning or full release notes (egress blocked), so the **official** wording of the deprecation-window policy ("N versions") is not quoted. The two-major window is inferred from issues #10164/#11815 and the community guide's "removed in v16" notes.
- No confirmed information on a v15 Prototype/Development release or its date as of Sept 2026.
- The v14 change list relies on a community document. Items should be checked against the official 14.x release notes before acting on them.

## 2. Extensibility patterns (CONFIG registries, public API, hooks, DataModels, AE-friendly data, i18n, ApplicationV2 PARTS)

### Takeaway
The reference pattern (dnd5e) is a single namespaced API object built from modules (`applications`, `config`, `dataModels`, `documents`, `utils`, `migrations`, …). It is published on `globalThis.<system>` and merged into `game.system`, the config object is assigned to `CONFIG.<SYSTEM>`, DataModels are registered through `CONFIG.<Doc>.dataModels`, and namespaced hooks are fired at lifecycle points. odd-rpg already has `CONFIG.ODD` and TypeDataModels. What it still needs is the public API object, custom hooks, and a rule that every rules constant is read from `CONFIG.ODD` at runtime, never imported directly.

### Cited Findings
- dnd5e exposes `globalThis.dnd5e = { applications, canvas, config: DND5E, dataModels, dice, documents, enrichers, Filter, inserts, migrations, registry, rules, ui: {}, utils }` and then does `game.dnd5e = Object.assign(game.system, globalThis.dnd5e)` — [dnd5e.mjs (master)](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs).
- dnd5e registers models centrally: `CONFIG.Actor.dataModels = dataModels.actor.config; CONFIG.Item.dataModels = dataModels.item.config; CONFIG.ChatMessage.dataModels = …; Object.assign(CONFIG.ActiveEffect.dataModels, dataModels.activeEffect.config)` — [dnd5e.mjs](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs).
- dnd5e fires namespaced hooks such as `Hooks.call("dnd5e.setupCalendar")` and `Hooks.callAll("dnd5e.ready")` so modules can extend it without patching — [dnd5e.mjs](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs).
- Foundry core now has a `preRenderApplication` hook, plus `render`/`close`/`position` hooks and events for ApplicationV2 — [vagabond v14 guide](https://github.com/mordachai/vagabond/blob/main/FOUNDRY_V14_MIGRATION.md).
- In v14, Active Effect changes support application **phases** to "leverage precise data preparation timing and avoid priority competition" — [search summary of Foundry 14.x notes](https://foundryvtt.com/releases/14.352).
- Draw Steel ships English-only core compendia and leaves other languages to separate Babele translation modules. It uses the i18n-ally VS Code extension, reading `foundry/lang` and `lang`, with nested keys — [draw-steel CONTRIBUTING.md](https://github.com/MetaMorphic-Digital/draw-steel/blob/develop/CONTRIBUTING.md).

### Inferences
- **Public API:** in `init`, build `const api = { config: ODD, dataModels, documents, applications, dice, utils, migrations }`, then assign `globalThis.odd = api` and `Object.assign(game.system, { api })` (or merge like dnd5e). Type it with a `declare global` block so TS modules and macros can use it. This makes the API the documented boundary, and everything else can be treated as internal.
- **Registries over constants:** attributes, skills, dice, wounds and strain should be read from `CONFIG.ODD.*` at use-time, including sheet context builders and roll code, never from a direct `import { SKILLS }`. A module can then add a skill in a `setup` hook and have it appear in sheets, rolls and AE key lists. Fire `Hooks.callAll("odd.setupConfig", CONFIG.ODD)` before freezing or deriving anything from config.
- **Namespaced hooks** at the extension points features actually use: `odd.preRoll`/`odd.roll` (payload mutable in the `pre` hook, returning `false` cancels), `odd.preApplyWound`, `odd.initiativeOrder`, `odd.ready`. Each costs one line and saves downstream libWrapper patching.
- **AE-friendly data:** keep stored fields in `defineSchema` and compute totals in `prepareDerivedData`, so AEs can target either base or derived keys. Always call `super` in the `prepare*` overrides (a hard requirement in v14 per the `_completedActiveEffectPhases` note above). Use v14 phases rather than priorities if AE targets derived values.
- **Sheets:** ApplicationV2 `static PARTS` plus Handlebars partials let modules add or override a part through `CONFIG` or `render` hooks. Keep each part's context in its own `_preparePartContext` case so one part can be added without editing the others. Add `data-sync` on any `<details>` (v14).
- **Localization-first:** every label in `CONFIG.ODD` should be an i18n key (`ODD.Skill.Athletics.label`) and never a literal. Add i18n-ally and an ESLint check or script that fails on missing keys.

### Gaps
- Could not fetch pf2e, SWADE, Cosmere RPG, Lancer or Daggerheart source in the tool budget, so their API and hook conventions are not cited here. Only dnd5e's `dnd5e.mjs` was read directly.
- The official DataModel `migrateData`/`cleanData`/`shimData` API docs were not reachable (foundryvtt.com blocked).

## 3. Data migrations and compendium pack pipeline

### Takeaway
Use two layers. `static migrateData(source)` on each TypeDataModel handles field renames and reshapes lazily, at load time. A GM-only, version-gated world migration runs in `ready` for anything that must be persisted or that crosses documents. dnd5e gates its world migration on a `systemMigrationVersion` setting compared with `needsMigrationVersion`/`compatibleMigrationVersion` values kept in `system.json` `flags`. Compendia should live as JSON or YAML source in git and be compiled with `@foundryvtt/foundryvtt-cli` in the build, as Draw Steel and Foundry's own Crucible system do.

### Cited Findings
- dnd5e `_handleMigration()` in `ready`: `if ( !game.user.isGM ) return`. It reads the `systemMigrationVersion` setting and skips new empty worlds (`if ( !cv && totalDocuments === 0 )`). It returns early if `!isNewerVersion(game.system.flags.needsMigrationVersion, cv)`, and shows a persistent error if the world is older than `game.system.flags.compatibleMigrationVersion` — [dnd5e.mjs](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs).
- dnd5e keeps its migration logic in `module/migration.mjs` (`migrateWorld`), and it also migrates compendium pack folders — [dnd5e repo search snippet](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs); [DeepWiki dnd5e overview](https://deepwiki.com/foundryvtt/dnd5e/1-dnd5e-system-overview) (secondary).
- Known pitfall: dnd5e issue "System migrations that change the document's type fail in V13" — [dnd5e #5468](https://github.com/foundryvtt/dnd5e/issues/5468). Another: an unnecessary migration ran on worlds without settings, and the fix was to use `systemVersion` from the manifest — [dnd5e #1470](https://github.com/foundryvtt/dnd5e/issues/1597/linked_closing_reference).
- The `@foundryvtt/foundryvtt-cli` package exports `compilePack(src, dest, {yaml, nedb, …})` and `extractPack(...)`. JSON is the default source format, and `yaml: true` switches to YAML — [foundryvtt-cli README](https://github.com/foundryvtt/foundryvtt-cli/blob/main/README.md); [npm](https://www.npmjs.com/package/@foundryvtt/foundryvtt-cli). Foundry's own Crucible system uses it in `build.mjs` — [crucible build.mjs](https://github.com/foundryvtt/crucible/blob/master/build.mjs).
- Draw Steel workflow: `npm run build:packs` compiles `src/packs` JSON into LevelDB. Then unlock the compendium in Foundry with no modules active, edit, close Foundry, and run `npm run unpack` to write the changes back as JSON diffs for commit. Content restrictions: no third-party, playtest or unlicensed content — [draw-steel CONTRIBUTING.md](https://github.com/MetaMorphic-Digital/draw-steel/blob/develop/CONTRIBUTING.md).
- Alternative tooling: `@vauxs-fvtt/foundry-pack-tools` — [npm](https://www.npmjs.com/package/@vauxs-fvtt/foundry-pack-tools).

### Inferences
- For odd-rpg, add a `src/migrations/` folder with an ordered list of `{ version: "0.9.0", migrateActor?, migrateItem?, migrateEffect? }` steps. Add a world setting `migrationVersion` and `system.json` `flags.needsMigrationVersion`, and a `ready` handler modelled on dnd5e. Also run the same steps over unlocked world compendia. Put pure field reshapes in `migrateData` as well, so compendium and imported data is fixed on read.
- semantic-release can bump `flags.needsMigrationVersion` only when a commit carries a `migration:` footer or scope. Otherwise leave it pinned, which keeps migrations from running on every release.
- Add `packs` to `system.json` now, even if they start empty, with a `src/packs/<name>/*.yml` → `packs/<name>` compile step in the Vite build or CI. Add an `unpack` script so content edits go back to git. LevelDB output should be gitignored.
- A CI job that compiles packs, then runs every pack document through `new CONFIG.Item.dataModels[type](doc.system)` validation, catches schema drift early and cheaply.

### Gaps
- pf2e's migration runner (numbered migration classes keyed by schema version) was not fetched and is described here only from general knowledge. Not cited, so it should not be relied on.
- Exact current signatures and semantics of `DataModel.migrateData`/`shimData`/`cleanData` in v14 were not verified (docs blocked).

## 4. Testing (Quench, Vitest with mocked globals, Playwright plus Docker, multi-version CI)

### Takeaway
Use layers: (1) Vitest unit tests for pure rules logic, kept free of Foundry globals, which is the cheapest layer; (2) Quench batches for in-Foundry integration tests (DataModel validation, derived data, AE application, sheet render smoke tests); (3) a Playwright job that starts `ghcr.io/felddy/foundryvtt` pinned to v13 and v14 builds, loads a fixture world, and runs the Quench batches headlessly. Big systems vary a lot here: Draw Steel's CONTRIBUTING does not mention tests at all.

### Cited Findings
- Quench runs Mocha, Chai and fast-check test batches inside a live Foundry, with its own test-runner UI. Batches are registered with `quench.registerBatch(key, (context) => {...})`, where `context` provides `describe/it/before/after…` and `assert/expect/should` — [Ethaks/FVTT-Quench](https://github.com/Ethaks/FVTT-Quench); [Quench docs](https://ethaks.github.io/FVTT-Quench/index.html).
- Quench needs a running Foundry. Some developers drive it in CI through Cypress, and a blog post describes automating module tests against Foundry — [Quench search summary](https://github.com/Ethaks/FVTT-Quench); [XDXA "FoundryVTT Module Test Automation" (2023)](https://xdxa.org/2023/foundryvtt-module-test-automation/).
- Draw Steel's contributing guide requires resolving all ESLint warnings (JS, Handlebars, HTML) but says nothing about testing — [draw-steel CONTRIBUTING.md](https://github.com/MetaMorphic-Digital/draw-steel/blob/develop/CONTRIBUTING.md).
- The felddy image is published on `ghcr.io/felddy/foundryvtt`, and v14 images use Node 24 — [felddy #1385](https://github.com/felddy/foundryvtt-docker/discussions/1385).

### Inferences
- For a ~3k-LOC TS system, the best return comes from moving dice math, wound and strain thresholds, and initiative ordering into pure functions that take `CONFIG.ODD` as a parameter, then covering them with Vitest. No Foundry mocks are needed, which avoids fragile global stubs.
- The Quench layer should hold a small set of "contract tests": create an actor of each type, check that `prepareDerivedData` output matches, apply an AE of each change type, and render each sheet (catches template errors). Run these in CI against both the `minimum` and `verified` Foundry versions using the felddy image, with the version pinned per matrix entry. This needs the `FOUNDRY_USERNAME`/`FOUNDRY_PASSWORD` or release-URL secrets, plus a license key.
- Set `CONFIG.debug.compatibility = FAILURE` in the test world so any deprecated-API call fails CI. This gives early warning of the next major's removals.

### Gaps
- Could not verify which of dnd5e, pf2e, Daggerheart, Cosmere RPG, SWADE or Lancer run Quench or Playwright in CI (not fetched within budget).
- The exact felddy env var for pinning a Foundry version (commonly `FOUNDRY_VERSION`) was not confirmed from the fetched discussion.

## 5. Developer experience (Vite proxy/HMR, core hotReload, symlinks, typed templates, schema-derived types)

### Takeaway
Two complementary mechanisms are available. Foundry core's `flags.hotReload` in the manifest injects changed `.css/.hbs/.html/.json` (lang) files into a running world without a reload. A Vite dev server on port 30001, proxying everything else to Foundry on 30000 (including the `/socket.io` websocket), serves source with HMR for CSS and a fast full reload for TS. odd-rpg currently has no `flags.hotReload`, so adding it is a free improvement.

### Cited Findings
- Foundry core hot reload: packages can list paths to watch, and changes to those files are injected into the running world and re-rendered without a page refresh. Supported types are `.js, .mjs, .css, .html, .hbs, .json`. There is a `hotReload` hook — [Foundry API hookEvents.hotReload (v14 docs, snippet)](https://foundryvtt.com/api/functions/hookEvents.hotReload.html); [search summary](https://foundryvtt.wiki/en/development/guides/vite).
- Community wiki Vite guide: a dev server on port 30001 proxies requests that do not match the system path to `http://localhost:30000/`, with websocket proxying for `/socket.io`. Browse `http://localhost:30001/`. CSS hot-reloads automatically, while plain ES modules need extra work for HMR — [foundryvtt.wiki Vite guide (snippet)](https://foundryvtt.wiki/en/development/guides/vite).
- Lancer documents its development setup, including its Vite-based build, in a wiki page — [foundryvtt-lancer Development Setup](https://github.com/Eranziel/foundryvtt-lancer/wiki/Development-Setup) (not read in full).
- Draw Steel requires contributors to use a dev (git) install of the system rather than the package-repository version — [draw-steel CONTRIBUTING.md](https://github.com/MetaMorphic-Digital/draw-steel/blob/develop/CONTRIBUTING.md).

### Inferences
- Add to `system.json`: `"flags": { "hotReload": { "extensions": ["css","hbs","json"], "paths": ["styles","templates","lang"] } }`. Check the exact key shape against the v14 manifest docs. Pair it with Vite `build --watch` into a folder symlinked to `Data/systems/odd-rpg`.
- Typed Handlebars contexts: define one `interface <Part>Context` per ApplicationV2 PART and return it from `_preparePartContext`. With fvtt-types, derive system-data types from `defineSchema()` (`foundry.data.fields.SchemaField.SourceData`/`InitializedData` style helpers) rather than hand-written interfaces, so schema and types cannot drift.

### Gaps
- Full text of the wiki Vite guide and Foundry's hotReload manifest spec could not be read (blocked). Config keys above are from snippets and should be verified.

## 6. Process (branching, ADRs, feature flags, releases, tracking prereleases, compat layer)

### Takeaway
Well-run systems use milestone or release branches with `main` equal to the latest release, strict linting as a PR gate, a rule that a feature request comes before a PR, and pack sources in git. For a single-owner TS system, the cheapest additions are a `release/13.x` maintenance branch policy, CI against the upcoming Foundry Testing build, a compat module isolating private and version-sensitive Foundry calls, and settings-gated experimental features.

### Cited Findings
- Draw Steel does development on milestone branches, and `main` holds the most recently released version, merged only after a release. Contributors open a feature-request issue before or alongside a PR, judged on whether the rules as written support the feature. Lint must be clean (`npm run lint`, `lint:fix`) — [draw-steel CONTRIBUTING.md](https://github.com/MetaMorphic-Digital/draw-steel/blob/develop/CONTRIBUTING.md).
- dnd5e maintains per-minor branches (`3.1.x`, `4.1.x`, `5.3.x`, master) — [dnd5e 5.3.x branch](https://github.com/foundryvtt/dnd5e/blob/5.3.x/dnd5e.mjs).
- Foundry exposes `CONFIG.debug.compatibility` modes for surfacing deprecations — [Foundry API migration guide snippet](https://foundryvtt.com/article/migration/). The "Silence Compatibility Warnings" package exists because these warnings are noisy for end users — [package page](https://foundryvtt.com/packages/silence-compatibility-warnings).
- Foundry makes no stability promise for private API methods — [Foundry migration guides snippet](https://foundryvtt.com/article/migration/).

### Inferences
- **Compat layer:** add `src/compat/` with thin wrappers such as `getAEChangeType(change)`, `renderTemplate` or `TextEditor.enrichHTML` namespace lookups (`foundry.applications.handlebars.*` vs globals), and any `_private` overrides. A Foundry major bump then becomes a one-folder change plus a green CI matrix.
- **Feature flags:** register a world setting like `odd.experimental.<feature>` (hidden, `config: false`, or behind a single "Experimental features" menu) so half-built features can merge to main. Combined with semantic-release, this avoids long-lived branches.
- **ADRs:** keep short `docs/adr/NNN-*.md` files for decisions that constrain extension: data shape, where derived values live, hook names and payloads, and the public API surface. Hook names and API shape amount to a semver contract, so a `feat!:`/`BREAKING CHANGE:` commit should be required when they change.
- **Track Foundry early:** add a scheduled (weekly) CI job running the Quench suite against the newest Testing or Development felddy tag, allowed to fail. Bump `verified` when it goes green.

### Gaps
- No primary source found for Foundry's official "how to use prototype/testing channels as a package developer" guidance (versioning article blocked).
- ADR and feature-flag practice among the named systems was not verified.
