# fvtt-types (League-of-Foundry-Developers/foundry-vtt-types): status and typing depth for recent Foundry VTT versions (as of 2026-09-23)

Method: I cloned the repo (`main` @ `b0100830b`, 2026-09-22) and its wiki, read the npm registry JSON for `fvtt-types` and `@league-of-foundry-developers/foundry-vtt-types`, read odd-rpg's own `package-lock.json`, and ran web searches for Foundry release info. foundryvtt.com was blocked by the network proxy, so Foundry release facts come from search-result snippets of foundryvtt.com pages and from a third-party Docker image's release list. The GitHub MCP tools could not reach this repo from this session, so issue counts come from WebFetch of the GitHub issues page.

Repo base URL used below: R = https://github.com/League-of-Foundry-Developers/foundry-vtt-types

## Q1. What is the latest Foundry VTT stable version (Sept 2026)? Is v14 stable? Is v15 in development?

### Takeaway
Foundry v14 has been the stable generation since 14.359 (1 April 2026). The latest stable is **14.368** ("Version 14 Stable 10"), published around 20 September 2026. I found no public v15 development or prototype builds. Foundry says v15 planning comes after v14 is finished and a "Version 14.5" of non-breaking improvements. **odd-rpg (compatibility minimum/verified 13) is now one major version behind.**

### Cited Findings
- 14.359 was "Version 14 Stable 1", released 1 April 2026, and was deliberately modest in scope. At launch only D&D 5e, Crucible and the Universal Tabletop System were confirmed compatible. — [foundryvtt.com/releases/14.359 (via search snippet)](https://foundryvtt.com/releases/14.359); [Prism News](https://www.prismnews.com/hobbies/pathfinder/foundry-vtt-version-14-stable-release-prompts-pathfinder-2e)
- 14.368 is "Version 14 Stable 10": a modest set of bug fixes and UI/API improvements, plus performance work for very large multi-Level scenes. It changed the default top elevation of a Level to 4 × grid distance. — [foundryvtt.com/releases/14.368 (search snippet)](https://foundryvtt.com/releases/14.368)
- 14.365 = "Version 14 Stable 7". — [foundryvtt.com/releases/14.365](https://foundryvtt.com/releases/14.365)
- Docker image release list, newest first: v14.368.0 (Sep 20), 14.367.0 (Aug 19), 14.366.0 (Aug 18), 14.365.0 (Jul 18), 14.364.0 (Jun 18), 14.363.0 (May 22), 14.361.0 (May 7), 14.360.0 (Apr 10), 14.359.0 (Apr 3). The last v13 image is v13.351.0. The fetch tool printed the year as "2024", which must be a parsing error: 14.359 is independently dated April 2026. Month and day are plausible. — [felddy/foundryvtt-docker releases](https://github.com/felddy/foundryvtt-docker/releases)
- The v14 "pillars" are Scene Levels, Active Effects V2, Scene Regions V2, ProseMirror improvements and pop-out applications. — [search summary of foundryvtt.com v14 release notes](https://foundryvtt.com/releases/14.359)
- Foundry's anniversary article (around May 2026) says v15 will start once v14 is complete. Some Electron and Setup-screen work was postponed to a non-breaking "Version 14.5" during the stable period, and v15's headline feature will again come from a Patreon community vote. — [Year in Review 2026](https://foundryvtt.com/article/year-in-review-2026/)
- fvtt-types itself tracks "Version v14.368" in pinned issue #3500, which confirms 14.368 as the current target build. — [R/issues/3500](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3500)

### Inferences
- Final v13 build: probably 13.351 (last v13 Docker tag). fvtt-types v13 typed build 13.346, not 13.351.
- A v15 prototype could appear any time after Sept 2026, but I found no evidence that one exists.

### Gaps
- I could not open foundryvtt.com/releases directly (egress blocked), so I could not confirm the exact 14.368 date or the absence of v15 prototypes from the primary page.

## Q2. What versions does fvtt-types support? npm and release status, and what is `main` tracking?

### Takeaway
**`main` switched from v13 to v14 on 2026-05-28** and now targets 14.366→14.368. **Neither v13 nor v14 has a stable (non-prerelease) npm release.** The newest stable npm release is the v12 line: git tag v12.331.5, and the README still calls v10–v12 "partial". v13 exists only as `-beta` npm builds (last one 2025-12-09) plus git commits on `main` up to 2026-05-27. There is **no v13 maintenance branch**, only `v12`. v14 is published as automated `beta` npm builds on every push to `main`, several per day in September 2026. **odd-rpg's `#main` dependency is locked to a v13-era commit from 2026-01-06. Re-running `npm install fvtt-types@github:…#main` would silently move it to the v14 types.**

### Cited Findings
- **npm `fvtt-types` dist-tags:** `latest: 13.346.0-beta.20250812191140`, `prerelease: 14.366.0-beta.20260816170037`, `beta: 14.366.0-beta.20260922013222`. There are no non-beta versions at all under the `fvtt-types` name: 152 × `13.346.0-beta.*` (2025-07-04 → 2025-12-09) and 50 × `14.366.0-beta.*` (2026-08-15 → 2026-09-22). — [registry.npmjs.org/fvtt-types](https://registry.npmjs.org/fvtt-types) (fetched 2026-09-23); [npmjs.com/package/fvtt-types](https://www.npmjs.com/package/fvtt-types)
- **npm `@league-of-foundry-developers/foundry-vtt-types`:** same `latest`/`prerelease`/`beta` tags, plus legacy tags `fvtt-0.7.9`, `fvtt-0.7.10`, `fvtt-0.8.8`, `fvtt-0.8.9`. — [registry.npmjs.org/@league-of-foundry-developers/foundry-vtt-types](https://registry.npmjs.org/@league-of-foundry-developers%2ffoundry-vtt-types)
- **How publishing works:** every push to `main` that passes typecheck, lint and tests publishes `<package.json version>-beta.<timestamp>` to both package names with `--tag beta`. A stable publish happens only on a GitHub "release" event. — [R/.github/workflows/ci.yml (publishPrerelease / publishRelease jobs)](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/.github/workflows/ci.yml)
- **npm publishing gap:** no npm builds at all between 2025-12-09 and 2026-08-15, even though `main` received about 420 commits in Mar–Jun 2026 (git log counts). — [npm registry JSON](https://registry.npmjs.org/fvtt-types); repo git history
- **Current `main` version:** `package.json` on `main` says `"version": "14.366.0"` (2026-09-22). — [R/package.json](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/package.json)
- **When `main` moved to v14:** commit `9d9161964` "update to v14.363" (2026-05-28) was the first `14.x` version on `main`, followed by `1216f5b22` "Begin v14.364.0" (2026-07-12). The last v13 commit on `main` is `62d191af61487e0dca54d716bc18197dc009a7ea` ("Be able to run tests", 2026-05-27, version 13.346.0). — [R/commit/9d9161964](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/commit/9d9161964); [R/commit/62d191af6](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/commit/62d191af61487e0dca54d716bc18197dc009a7ea)
- **Git tags:** v13 tags are `v13.340.0` (2025-04-25), `v13.340.1` (2025-04-30), `v13.341.1` and `v13.345.1` (both 2025-07-04). The latest v12 tag is `v12.331.5` (2025-05-25). There are no v14 tags. The only version branch is `v12`. — [R/tags](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tags); [R/branches](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/branches)
- **README is stale.** It still says: "versions 0.7, 0.8, and 9 are fully supported with partial support for versions 10, 11, and 12. Work on support for version 13 is currently underway." It also says "Currently v13 is still in beta. There are known bugs, issues in the ergonomics, and unfinished work", and recommends `npm add -D fvtt-types@github:League-of-Foundry-Developers/foundry-vtt-types#main`. It warns that the lockfile pins the commit, so you must re-run the command to update. — [R/README.md](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/README.md)
- **odd-rpg's actual pin:** `package-lock.json` resolves `fvtt-types` to `…foundry-vtt-types.git#d7751f280498c9d749c5bd821628ab2be9acefbc`, version 13.346.0. That commit is "Switch to Playwright alpha to work with latest TS/TS-Go", 2026-01-06. It is 246 commits behind the last v13 commit (62d191af6) and about 1,050 commits behind current `main`. — local `/home/user/odd-rpg/package-lock.json` line ~5455; repo git history
- **Tracking issues:** #3500 "Version v14.368" is pinned and tracks the file-by-file v13→v14 diff, including new v14 files (e.g. `level.mjs`, VFX) and removed v13 files (e.g. `head.js`, `tail.js`, `measured-template.mjs`). #3374 "Documentation Issues For v13.347" (opened 2025-06-10, 24 comments) and #3686 "Documentation issues for v14.368" (opened 2026-08-01, 18 comments) are also open. — [R/issues/3500](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3500); [R/issues](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues)

### Inferences
- **Direct answer to "is the latest Foundry strongly typed?"** Yes, v14 (14.366+, tracking 14.368) is being actively typed on `main` and shipped as daily npm betas. It is officially "beta", and there has been no stable release since v12. Nobody has an "officially stable" type package for v13 or v14. v13 received about a year of beta work (Apr 2025 → May 2026) and was then frozen in place when `main` moved on.
- **Options for odd-rpg (targets v13):**
  - (a) Stay on the v13 line: pin `github:League-of-Foundry-Developers/foundry-vtt-types#62d191af61487e0dca54d716bc18197dc009a7ea` (most complete v13 state), or the npm build `fvtt-types@13.346.0-beta.20251209192131`. Never write plain `#main` in a fresh install.
  - (b) Move the system to v14 and follow `fvtt-types@beta` from npm, which is reproducible and semver-sortable, instead of a git ref.
- The `latest` npm dist-tag points to an Aug 2025 v13 beta. `npm i fvtt-types` with no tag therefore gives an old v13 build, not the current one.

### Gaps
- I could not see the GitHub Releases page contents: whether v13.345.1 or v12.331.5 have release notes, and which ones are marked "pre-release".
- There is no CHANGELOG file in the repo, so the per-version changelog is only in commits and PRs.
- I could not determine why npm publishing paused between Dec 2025 and Aug 2026 (likely CI or test failures during the v14 migration; unverified).

## Q3. How strongly is each area typed?

### Takeaway
Coverage is broad: 812 `.d.mts` files mirroring Foundry's `client/` and `common/` trees. It is also *deep* in the core areas: documents, DataModel schema inference, CONFIG, hooks, settings, ApplicationV2 generics, and `game` initialization states. The design deliberately favours soundness. That strictness (possibly-uninitialized `game`, subtype-union `system`, `Actor.Implementation` in sheets) is the main reason projects accumulate casts. Canvas/PIXI and rarely used APIs are typed but less polished, and documentation lives mostly in source TSDoc and test files. The wiki was last updated in 2021–2023 and describes pre-v10 APIs.

### Cited Findings
- **Size and layout:** 812 `.d.mts` files under `src/`, mirroring `foundry/client`, `foundry/common` and `foundry/public`. The package ships the `fvtt-types`, `fvtt-types/lenient`, `fvtt-types/utils`, `fvtt-types/configuration` and `fvtt-types/workers` entry points. — [R/package.json "exports"](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/package.json); [R/src](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/src)
- **Bundled third-party typings (runtime deps):** pixi.js (a League fork, `github:foundry-vtt-types/pixi.js#main`), `@pixi/particle-emitter` and `@pixi/basis` forks, jQuery, Handlebars, ProseMirror (all packages), CodeMirror 6, socket.io-client, showdown, tinymce, peggy, simple-peer. — [npm fvtt-types manifest `dependencies`](https://registry.npmjs.org/fvtt-types)
- **`game` global:** declared as `let game: Games[GameHooks]`, a union of `UninitializedGame | InitGame | I18nInitGame | SetupGame | ReadyGame`. `UninitializedGame` has every `Game` property typed as optional `never`, except `view`. `ui` is `Partial<UiApplications>` unless `ready` is assumed. — [R/src/foundry/client/head.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/head.d.mts)
- **`AssumeHookRan` (why `game` looks possibly uninitialized, and how to opt out):** the source docs explain that globals like `game` are only initialized after certain events, "the correct types for these variables include the types for the uninitialized state". Merging a property named `init` | `i18nInit` | `setup` | `ready` into `AssumeHookRan` types `game` as its initialized state. A special key `none` makes the default `undefined` instead of a union. — [R/src/configuration/configuration.d.mts L7–40](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **`fvtt-types/lenient` entry point:** its whole content is `declare global { interface AssumeHookRan { ready: never; } }`, i.e. "assume `ready` ran" everywhere. — [R/src/index-lenient.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/index-lenient.d.mts)
- **`game.keybindings` and `game.combat` are fully typed on `Game`:** `readonly keybindings: foundry.helpers.interaction.ClientKeybindings` (with a remark that core keybindings are only registered at `ready`), and `get combat(): foundry.documents.collections.CombatEncounters["viewed"]`. The casts in odd-rpg's `(game as any).combat` / `(game as any).keybindings` exist only because of the uninitialized-`game` union, not because of missing types. — [R/src/foundry/client/game.d.mts L280–283, L473](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/game.d.mts)
- **Documents and system subtypes (`DataModelConfig`):** "Merge into this interface to configure known subtypes for the 11 (as of 14.365) Documents with a TypeDataField: ActiveEffect, Actor, Card, Cards, ChatMessage, Combat, Combatant, CombatantGroup, Item, JournalEntryPage, and RegionBehavior." Each document type must declare all of its subtypes in a single merge. — [R/src/configuration/configuration.d.mts ~L190–213](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **`TypeDataModel` generics:** `TypeDataModel<Schema extends DataSchema, Parent extends Document.Any, BaseData extends AnyObject = EmptyObject, DerivedData extends AnyObject = EmptyObject>`. The schema type drives inference of instance fields, source, and create/update data. — [R/src/foundry/common/abstract/type-data.d.mts L316–321](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/common/abstract/type-data.d.mts)
- **Schema inference is tested end to end.** The actor test defines a `BoilerplateCharacter` TypeDataModel from `defineSchema` and asserts inferred types of nested fields. Example: `expectTypeOf(this.extra.deep.check.propA).toEqualTypeOf<string>()`, with derived props typed as `number | undefined`. It then registers the model via `interface DataModelConfig { Actor: { character: typeof BoilerplateCharacter } }`. — [R/tests/foundry/common/documents/actor.test-d.ts ~L190–231](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/common/documents/actor.test-d.ts)
- **Subtype helpers:** `Actor.SubType`, `Actor.ConfiguredSubType`, `Actor.Known` (= `Actor.OfType<Actor.ConfiguredSubType>`), `Actor.OfType<Type>` (a document narrowed to a subtype) and `Actor.SystemOfType<Type>`. — [R/src/foundry/client/documents/actor.d.mts L107–136](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/documents/actor.d.mts)
- **`SystemConfig` (why `actor.system.foo` errors):** "By default fvtt-types forces you to account for all possible subtypes of a document… if you try writing `item.system.someProp` you are going to get an error like: Property 'someProp' does not exist on type 'SystemOfType<...>'… 'UnknownTypeDataModel'." The options are:
  - `discriminate: "all"` makes `system.someProp` `T | undefined`.
  - `moduleSubtype: "ignore"` and `base: "ignore"` drop module subtypes and the `"base"` type (acknowledged as "even more unsound").
  — [R/src/configuration/configuration.d.mts L401–437](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **Custom document classes:** `DocumentClassConfig { Actor: typeof MyActor }`, plus (for generic subclasses) `ConfiguredActor<SubType extends Actor.SubType> { document: CustomActor<SubType> }`. `Configured*` interfaces exist for the same 11 subtype-bearing documents. `PlaceableObjectClassConfig { Token: typeof MyToken }` does the same for canvas objects. The docs stress that it is "extremely important that this is kept in sync with the configuration that actually happens at runtime". — [R/src/configuration/configuration.d.mts L42–98](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts); [R/src/configuration/documents.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/documents.d.mts); [R/tests/types/configuredDocuments.test-d.ts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/types/configuredDocuments.test-d.ts)
- **Global vs module merge:** `src/types/config.d.mts` declares global interfaces such as `interface AssumeHookRan extends configuration.AssumeHookRan {}`, and the repo's own tests merge via `declare global { interface DataModelConfig … }`. Both `declare global` and `declare module "fvtt-types/configuration"` work. The in-source docs use the module form. — [R/src/types/config.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/types/config.d.mts)
- **Settings (`SettingConfig`):** a single interface keyed `"namespace.key"`. Core settings are pre-declared with DataField types (e.g. `"core.chatBubbles": fields.BooleanField<{ initial: true }>`). Tests show user entries as plain types (`"foo.bar": boolean`), DataModel classes (`Actor.ImplementationClass`) or field instances (`typeof dataField`). — [R/src/configuration/configuration.d.mts L256+](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts); [R/tests/foundry/client/helpers/client-settings.test-d.ts L14–20](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/client/helpers/client-settings.test-d.ts)
  - The wiki "Settings" page (last edited 2021-12-05) still documents the obsolete `namespace ClientSettings { interface Values }` form. **Do not follow it.** — [wiki/Settings](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/Settings)
- **Other configuration interfaces:**
  - `FlagConfig` (typed `getFlag`/`setFlag`)
  - `ModuleConfig` and `RequiredModules` (typed `game.modules.get(id)?.api`, and removing `undefined`)
  - `SystemNameConfig` (`game.system.id` typed as a literal)
  - `GetDataConfig` (AppV1 only)
  - `WebRTCConfig`
  - `DataConfig`/`SourceConfig` (legacy template.json typing)
  — [R/src/configuration/configuration.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **Hooks:** a dedicated `fvtt-types/configuration` `Hooks` export (`src/configuration/hooks.d.mts`). The repo has tests for custom hook declarations in `tests/custom/custom-hooks.d.ts` and `custom-error-hooks.d.ts`. — [R/src/configuration/index.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/index.d.mts); [R/tests/custom](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/tests/custom)
- **ApplicationV2 / DocumentSheetV2 / ActorSheetV2:** `ActorSheetV2<RenderContext extends ActorSheetV2.RenderContext, Configuration extends ActorSheetV2.Configuration, RenderOptions extends ActorSheetV2.RenderOptions> extends DocumentSheetV2<Actor.Implementation, RenderContext, Configuration, RenderOptions>`, and `ActorSheetV2.RenderContext extends DocumentSheetV2.RenderContext<Actor.Implementation>`. The sheet's document is always `Actor.Implementation` (every subtype), not generic per subtype. So `this.document.system` is the full subtype union unless narrowed. Type tests exist for Application, Dialog, DocumentSheet, HandlebarsApplication and about 20 concrete sheets. — [R/src/foundry/client/applications/sheets/actor-sheet.d.mts L17–21, L176](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/applications/sheets/actor-sheet.d.mts); [R/tests/foundry/client/applications](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/tests/foundry/client/applications)
- **`foundry.*` namespace vs globals:** `src/configuration/globals.d.mts` re-exports the legacy globals (e.g. `AmbientLight`, `Actors`), many marked `/** @deprecated */` in line with Foundry v13's move to namespaced `foundry.*` access. Some items are noted as "No longer global as of v13.344, nor exported anywhere accessible". The file also lets you merge into namespaces such as `foundry.dice.terms.RollTerm.Options` via `declare module "fvtt-types/configuration"`. — [R/src/configuration/globals.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/globals.d.mts)
- **Recent active areas (Sept 2026 PR titles):** "Fix Canvas" (#3775), "Fix pixi" (#3774), "Fix applications" (#3776), "Fix Common Utils" (#3777), "Generator<_, void, void>" (#3779), all merged 2026-09-21. — repo git log; e.g. [R/pull/3775](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/pull/3775)
- **Known open gaps (issues list):**
  - #3744: TS2310 "configured Combatant implementation recursively references itself" when declaring a generic `ConfiguredCombatant` (opened 2026-08-20; the reporter uses `@ts-expect-error`; the same pattern works for Actor, Item, Combat and ActiveEffect).
  - #3622: "Fields should be optional in `CreateData`" (2026-05-18).
  - #3607: "Improve `Document#clone` typing" (2026-04-29).
  - #3572: "`SchemaField<Schema>` produces different types" (2026-03-18).
  - #3710: "`RemoveIndexSignature` in `CONFIG`" (2026-08-10).
  - #3625: a possible new configuration interface (2026-05-25).
  — [R/issues](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues); [R/issues/3744](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3744)

### Inferences
- **Rough coverage grades (my assessment from source and tests, not an official statement):**
  - Documents/DataModel/TypeDataModel, CONFIG, settings, flags, `game`: **strong**. Schema-inferred, with type tests.
  - AppV2/DocumentSheetV2/HandlebarsApplicationMixin: **strong generics**. Sheets are not subtype-generic, so you narrow manually.
  - Hooks, dice/Roll, ChatMessage, Combat/Combatant: **typed**. The Combatant configured-class generic has a known bug (#3744).
  - Canvas/PIXI: **typed but still being fixed**, with ongoing "Fix canvas/pixi" PRs.
  - v14-only features (Levels, AE V2, Regions V2): **in progress** per #3500.
  - Documentation: **weak**. The wiki is stale and the README is out of date; the truth is in `configuration.d.mts` TSDoc and `tests/`.

### Gaps
- There are no per-area completeness percentages; the project publishes none.
- I did not verify TextEditor enrichers or `CONFIG.TextEditor.enrichers` typing in detail.
- I did not verify dice `Roll` generics or `ChatMessage.create` data typing in detail beyond their existence and tests.

## Q4. Recommended idioms that remove odd-rpg's specific casts

### Takeaway
Almost all of the listed escapes map to declaration-merging hooks that already exist in the configuration module (`"fvtt-types/configuration"`). Adding `AssumeHookRan`, `DocumentClassConfig`/`Configured*`, `DataModelConfig` and optionally `SystemConfig` to one `.d.ts`, then narrowing sheets by `document.type`, should remove most of the ~194 casts. The interface names below come from the source on `main` and have the same names at odd-rpg's pinned commit's era (13.346). The code blocks are illustrations assembled from the cited docs, not code copied verbatim from the repo.

### Cited Findings (patterns, each from repo source)
- **`(game as any).combat` / `(game as any).keybindings`:** fix with `AssumeHookRan`, or use `"types": ["fvtt-types/lenient"]`, which assumes `ready`:
  ```ts
  declare module "fvtt-types/configuration" {
    interface AssumeHookRan { ready: never } // or init/setup
  }
  ```
  — [configuration.d.mts L7–40](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts); [index-lenient.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/index-lenient.d.mts)
  - The sound alternative, from the wiki FAQ (2023): a `getGame()` helper that does `if (!(game instanceof Game)) throw …` and returns `Game`. — [wiki/FAQ](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ)
- **`(CONFIG as any).Actor.documentClass = OddActor`:** declare the class so that the assignment type-checks:
  ```ts
  declare module "fvtt-types/configuration" {
    interface DocumentClassConfig { Actor: typeof OddActor; Item: typeof OddItem }
    // if OddActor is generic over SubType:
    interface ConfiguredActor<SubType extends Actor.SubType> { document: OddActor<SubType> }
  }
  ```
  — [configuration.d.mts L42–69](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts); [documents.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/documents.d.mts)
- **`foundry.abstract.TypeDataModel<any, Item.Implementation>`:** pass the schema type instead of `any`:
  - Define `const schema = () => ({ … fields … })`.
  - Use `type Schema = ReturnType<typeof schema>`.
  - Write `class WeaponModel extends foundry.abstract.TypeDataModel<Schema, Item.Implementation> { static override defineSchema() { return schema(); } }`.
  - Optionally supply the `BaseData`/`DerivedData` generics for fields set in `prepareBaseData`/`prepareDerivedData`.

  — [type-data.d.mts L316–321](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/common/abstract/type-data.d.mts); [actor.test-d.ts BoilerplateCharacter](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/common/documents/actor.test-d.ts)
- **Register each subtype model:**
  ```ts
  declare module "fvtt-types/configuration" {
    interface DataModelConfig {
      Actor: { character: typeof CharacterModel; npc: typeof NpcModel };
      Item: { weapon: typeof WeaponModel };
    }
  }
  ```
  — [configuration.d.mts ~L190–213](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **`this.document.system as unknown as CharacterSystemData` in ActorSheetV2 subclasses:** because the sheet's document is `Actor.Implementation` (all subtypes), narrow with `if (this.actor.type === "character") { this.actor.system /* CharacterModel */ }`, or type a local as `Actor.OfType<"character">` after a guard. For `system.x` access without narrowing, set `SystemConfig { Actor: { discriminate: "all" } }`, which types the property as `T | undefined`. If odd-rpg never supports module-added subtypes, `moduleSubtype: "ignore"` and `base: "ignore"` also apply (the docs call this unsound). — [actor-sheet.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/applications/sheets/actor-sheet.d.mts); [actor.d.mts OfType/SystemOfType](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/documents/actor.d.mts); [configuration.d.mts SystemConfig](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)
- **Sheet render context:** extend the class generics, e.g. `class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2)<CharacterSheet.RenderContext>`, with `interface RenderContext extends ActorSheetV2.RenderContext { … }`. This gives `_prepareContext` a typed return instead of `any`. — [actor-sheet.d.mts L17–21, L176](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/applications/sheets/actor-sheet.d.mts); [tests/.../api/handlebars-application.test-d.ts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/tests/foundry/client/applications/api)
- **Settings:** declare `interface SettingConfig { "odd-rpg.someKey": boolean }` so that `game.settings.get("odd-rpg","someKey")` is typed. — [client-settings.test-d.ts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/client/helpers/client-settings.test-d.ts)
- **Flags, system id, modules:** `FlagConfig`, `SystemNameConfig { name: "odd-rpg" }` and `ModuleConfig`. — [configuration.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)

### Inferences
- With AssumeHookRan, DocumentClassConfig and DataModelConfig in place, typical remaining `@ts-expect-error` spots are:
  - generic `Configured*` classes for Combatant (bug #3744);
  - places where the sheet's subtype must be narrowed;
  - dynamic `CONFIG` keys on the system's own `CONFIG.ODD` namespace, which needs a `declare global { interface CONFIG { ODD: … } }` merge.

  The last pattern is inferred from the boilerplate test's use of `CONFIG.BOILERPLATE` and is not checked in detail.
- Caveat: odd-rpg's pinned commit (2026-01-06) is older than some of the documentation shown here, notably the "11 (as of 14.365) Documents" comment. The interface names have been stable since the v13 betas, but exact behaviour may differ slightly at the pin.

### Gaps
- I did not compile odd-rpg against either the pinned commit or v14 `main` to measure how many of the 194 escapes would disappear.

## Q5. Known issues: TypeScript version, performance, "deep instantiation", and maintainer activity

### Takeaway
The package declares a peer dependency of `typescript >=5.4` and also accepts `@typescript/native-preview` (TS-Go / TS 7). The repo itself builds with TypeScript ^6.0.2 plus native-preview. Development is very active: about 1,050 commits since odd-rpg's pin, and 280 commits in Aug 2026. It is concentrated in three people (esheyw, Bruno Melo, LukeAbby). Communication runs through the League Discord.

### Cited Findings
- **TypeScript requirement:** peer deps `"typescript": ">=5.4"` and `"@typescript/native-preview": "*"` (the npm manifest for the latest build says `^5.4`). Repo devDependencies are `typescript ^6.0.2` and `@typescript/native-preview ^7.0.0-dev.20251012.1`. The repo also has `tsconfig.nightly.json` and a `checkNightly.yml` workflow. — [R/package.json](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/package.json); [npm manifest](https://registry.npmjs.org/fvtt-types); [R/.github/workflows](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/.github/workflows)
- **odd-rpg's pinned commit** d7751f280 is literally "Switch to Playwright alpha to work with latest TS/TS-Go" (2026-01-06), which suggests the maintainers test against TS-Go. — repo git log
- **README tsconfig guidance:**
  - `"types": ["fvtt-types"]` (needed for the `game`/`CONFIG` globals)
  - `"target": "esnext"`
  - `"moduleResolution": "bundler"` (newer resolution modes are needed for `fvtt-types/utils`-style subpath imports)
  - `"strict": true` (at minimum `strictNullChecks` and `strictFunctionTypes`)
  - minimum lib `es2022`

  odd-rpg's tsconfig already matches all of these. — [R/README.md](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/README.md); local `/home/user/odd-rpg/tsconfig.json`
- **Commits per month on `main`:**

  | Month | Commits |
  |---|---|
  | 2025-09 | 30 |
  | 2025-10 | 45 |
  | 2025-11 | 47 |
  | 2025-12 | 53 |
  | 2026-01 | 2 |
  | 2026-02 | 0 |
  | 2026-03 | 40 |
  | 2026-04 | 180 |
  | 2026-05 | 176 |
  | 2026-06 | 24 |
  | 2026-07 | 235 |
  | 2026-08 | 280 |
  | 2026-09 (to 22nd) | 68 |

  — repo `git log --since=2025-09-01` on `main`
- **Commit authors, last 6 months:**

  | Author | Commits |
  |---|---|
  | esheyw | 502 |
  | Bruno Melo | 252 |
  | LukeAbby / Luke Abby | 188 |
  | dependabot | 28 |
  | Kai Moschcau | 8 |
  | Sylvercode | 2 |
  | Henry Malinowski | 2 |

  LukeAbby merges the PRs. — repo git log
- **Listed contributors in package.json:** LukeAbby, Kai Moschcau, Johannes Loher, Oskar Pfeifer-Bley, FloRad, NickEastNL, BoltsJ, JPMeehan. — [R/package.json](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/package.json)
- **Discord:** the README directs users to the "League of Extraordinary FoundryVTT Developers" Discord for v13 status and prioritisation (server id 732325252788387980). The repo tests cite Discord threads for regressions. — [R/README.md](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/README.md); [actor-sheet.test-d.ts comment](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/client/applications/sheets/actor-sheet.test-d.ts)
- **Open issues:** the issues page shows the pinned trackers (#3500, #3374, #3686) and recent type bugs listed in Q3. The fetch reported "207" in the repo navigation (likely open issues, not verified). — [R/issues](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues)
- **The source is still being cleaned up:** about 921 `TODO`/`FIXME`/`@privateRemarks` markers and 13 `@ts-expect-error` in `src/` (grep on `main`, 2026-09-22). — repo grep

### Inferences
- The types rely heavily on conditional and mapped types (subtype discrimination, schema inference, hook-state unions). This is why users report TS2310/TS2589-style recursion errors (e.g. #3744) and slower type-checking.
- Mitigations used in the ecosystem:
  - `skipLibCheck: true` (odd-rpg already sets it)
  - `incremental`
  - TS-Go (`tsgo`) for checking

  My searches found no quantitative benchmarks.
- The maintainers support v14 only on `main`. Staying on v13 means frozen types: no backports, because there is no v13 branch.

### Gaps
- I found no published compile-time or performance benchmarks, and no dedicated "performance" tracking issue in the search results.
- I found no specific "Type instantiation is excessively deep" issue for fvtt-types v13/v14 (the searches returned only generic TS content).
- I could not verify the exact open-issue and PR counts through the API (MCP access was limited to the odd-rpg repo, and `gh` is not installed).
- I found no list of production systems using fvtt-types with v13/v14. Searches surfaced only templates (e.g. [dustinlacewell/ModuleTemplate](https://github.com/dustinlacewell/ModuleTemplate)) and a contributor fork ([BM123499/foundry-vtt-types](https://github.com/BM123499/foundry-vtt-types)).
