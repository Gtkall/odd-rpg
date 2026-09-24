# Pin the types, skip the framework, target v14

odd-rpg has no Foundry framework worth porting to. Its architecture (TypeDataModel, ApplicationV2 with Handlebars PARTS, CONFIG registries, Vite) is already the shape every major reference system uses. The one framework that keeps that shape, VTTForge, is pre-1.0, has a single maintainer and supports only v14. The bigger problem is the types dependency. **Foundry v14 has been Stable since April 2026 (latest build 14.368), and fvtt-types moved its `main` branch to v14 on 2026-05-28.** v14 is now deeply typed, but only through daily `-beta` npm builds. v13 and v14 have never had a stable fvtt-types release, and no v13 branch exists. odd-rpg depends on `#main`, so any lockfile refresh jumps it silently from v13 to v14 types. There are alternatives: pf2e's hand-maintained type tree and its npm republications, types generated from core JSDoc, and framework-bundled subsets. None of them beats fvtt-types for a strict-TS codebase that relies on schema inference. **Most of odd-rpg's ~194 type escapes come from configuration it never set up, not from missing types.** No `DataModelConfig`, `DocumentClassConfig` or `AssumeHookRan` merge exists in `src/`, and CI never runs `tsc`. The plan is to pin the types, add four declaration merges plus a type-check gate, move the manifest to v14, and build extensibility through public APIs, hooks and a compat layer instead of a framework.

## No framework beats the architecture odd-rpg already has

All the reference systems checked (dnd5e, Daggerheart, Cosmere RPG, PF2e) build on plain Foundry APIs, and none publishes a reusable framework. **dnd5e ships with only rollup and the Foundry CLI as build dependencies and no TypeScript at all** ([dnd5e package.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/package.json)). Cosmere RPG is the closest analogue to odd-rpg: full TypeScript, fvtt-types, SCSS and Quench tests, still on v13 with `maximum: "13"` ([cosmere-rpg package.json](https://raw.githubusercontent.com/the-metalworks/cosmere-rpg/main/package.json); [system.json](https://raw.githubusercontent.com/the-metalworks/cosmere-rpg/main/src/system.json)). Porting onto something else would mostly relabel patterns odd-rpg already follows.

The candidates that do exist split into three groups.

**VTTForge** is the only true "opinionated system framework" found. It is an MIT SDK, CLI and Vite plugin. `registerSystem()` replaces the init hook, `BaseTypeDataModel` provides `InferSchema<T>`, and `BaseActorSheet`/`BaseItemSheet` add tabs, drag-drop and play/edit modes on top of ActorSheetV2 **while keeping Handlebars**. It also ships `audit` and `migrate` commands for v13→v14 ([vttforge/vttforge](https://github.com/vttforge/vttforge); [npm @vttforge/core](https://registry.npmjs.org/@vttforge/core); [npm @vttforge/cli](https://registry.npmjs.org/@vttforge/cli)). The risks are large. It was first published in May 2026, has had 35 CLI versions in four months, and treats "a minor bump [as] a breaking change". It has one npm maintainer and supports v14+ only. It also ships its own `@vttforge/types` surface, whose interaction with fvtt-types nobody has verified ([npm @vttforge/types](https://registry.npmjs.org/@vttforge/types)).

**TyphonJS Runtime Library (TRL)** is the long-standing Svelte framework. It effectively stalled, with no stable release since 0.2.0 in February 2025. **Every published version peer-pins `svelte >=4 <5`**, while Svelte 5 is at 5.57. The manifest is verified only against v13 ([npm @typhonjs-fvtt/runtime](https://registry.npmjs.org/@typhonjs-fvtt/runtime); [TRL module.json](https://raw.githubusercontent.com/typhonjs-fvtt-lib/runtime/main/module.json)). Adopting it would mean rewriting every sheet onto a legacy Svelte API.

**Thin UI adapters** each have one maintainer: fvtt-vue's `VueApplicationMixin` (12 commits), a SolidJS adapter first published August 2026, and ApplicationV2 helper mixins ([mouse0270/fvtt-vue](https://github.com/mouse0270/fvtt-vue); [npm foundry-solid-adapter](https://registry.npmjs.org/@phillip-best/foundry-solid-adapter); [foundry-applicationv2-expanded](https://github.com/dylanpiera/foundry-applicationv2-expanded)). The most serious Svelte 5 user, PF2e, keeps its integration in-repo alongside Handlebars and publishes no library ([pf2e package.json](https://raw.githubusercontent.com/foundryvtt/pf2e/master/package.json)).

| Option | What you get | Foundry | Maturity | Verdict for odd-rpg |
|---|---|---|---|---|
| VTTForge | registerSystem, typed schema base, sheet bases, audit/migrate | v14+ | 0.x, 1 maintainer | Borrow ideas; run `audit` once; don't adopt the runtime |
| TRL (Svelte 4) | Reactive app shells, component library | v13 | Stale, no Svelte 5 | Avoid |
| fvtt-vue / Solid adapter | ApplicationV2 mixin for another UI library | unstated / new | Tiny | Avoid |
| In-repo Svelte 5 mixin (PF2e pattern) | Reactive UI where needed | any | You own it | Only if a UI outgrows Handlebars |
| vite-plugin-foundryvtt | Vite HMR ↔ Foundry hotReload, proxy, pack building | any | 3.0.0, maintained | Adopt after the Vite 8 bump |

The pragmatic answer: stay on ApplicationV2 and Handlebars, which are still the documented core UI path in the v14 API ([foundry.applications.api](https://foundryvtt.com/api/modules/foundry.applications.api.html)). Take tooling rather than a framework. `vite-plugin-foundryvtt` bridges Vite HMR to Foundry's hotReload and builds packs, but **it peer-requires `vite ^8`, and odd-rpg is on `^6`** ([npm vite-plugin-foundryvtt](https://registry.npmjs.org/vite-plugin-foundryvtt)). A custom Svelte 5 mixin (Svelte's `mount`/`unmount` called inside the app's `_renderHTML`/`_replaceHTML`) only makes sense if a component such as the initiative tracker grows beyond what Handlebars handles comfortably. Even then, a few hundred lines you own carry less risk than any of the libraries above.

## fvtt-types types v14 deeply, but only as a moving beta

To answer question (2) directly: **yes, the latest Foundry (v14, tracking 14.368) is strongly typed, but the project calls it beta.** Every push to `main` that passes CI publishes `14.366.0-beta.<timestamp>` under the `beta` dist-tag. A stable publish only happens on a GitHub release, and none has been cut for v13 or v14 ([ci.yml](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/.github/workflows/ci.yml); [npm fvtt-types](https://registry.npmjs.org/fvtt-types)). The npm tags are misleading. **`latest` still points to `13.346.0-beta.20250812191140` from August 2025**, so a bare `npm i fvtt-types` installs a year-old v13 snapshot. The README still says v13 is "in beta" and that v10–12 are only partial ([README](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/README.md)).

The v13 line is frozen. The last v13 npm build is `13.346.0-beta.20251209192131`, and the last v13 commit on `main` is `62d191af6` (2026-05-27). The next day `main` became v14 ([commit 9d9161964](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/commit/9d9161964); [commit 62d191af6](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/commit/62d191af61487e0dca54d716bc18197dc009a7ea)). **odd-rpg's lockfile pins `d7751f28` (2026-01-06). That commit is 246 commits behind the final v13 state and roughly 1,050 behind current `main`.** `npm ci` respects the lock. But any `npm update`, lockfile regeneration or re-run of the README's install command now resolves `#main` to v14 types while the manifest still says v13.

Depth is uneven but strong where a system spends most of its time. The package has **812 `.d.mts` files** that mirror core's `client/` and `common/` trees ([src](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/tree/main/src)). `TypeDataModel<Schema, Parent, BaseData, DerivedData>` infers instance, source and update types from `defineSchema()`, and type tests assert nested field inference end to end ([type-data.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/common/abstract/type-data.d.mts); [actor.test-d.ts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/tests/foundry/common/documents/actor.test-d.ts)). Development is intense: **280 commits in August 2026**, concentrated in three people (esheyw, Bruno Melo, LukeAbby). But the source still carries about 921 TODO/FIXME markers, and the wiki describes pre-v10 APIs.

| Area | Typing depth (assessment from source and tests) |
|---|---|
| Documents, TypeDataModel schema inference, CONFIG, settings, flags, `game` lifecycle | Strong, with type tests |
| ApplicationV2 / DocumentSheetV2 / HandlebarsApplicationMixin | Strong generics; sheets are typed as `Actor.Implementation` (all subtypes), so you narrow manually |
| Hooks, Roll, ChatMessage, Combat | Typed; generic `ConfiguredCombatant` hits a TS2310 recursion bug ([#3744](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3744)) |
| Canvas / PIXI | Typed, still under active "Fix canvas/pixi" PRs ([#3775](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/pull/3775)) |
| v14-only features (Levels, Active Effects V2, Regions V2) | In progress per tracker [#3500](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3500) |
| Documentation | Weak; the TSDoc in `configuration.d.mts` and the tests are the real docs |

The project deliberately chooses soundness over convenience. `game` is a union of five lifecycle states, and the uninitialized one types every property as `never` ([head.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/head.d.mts)). `actor.system` is the union of every subtype unless you discriminate ([configuration.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/configuration/configuration.d.mts)). Those two choices explain most of the casts in odd-rpg.

## Four declaration merges remove most of odd-rpg's 194 casts

A local count puts the escapes in the sheets: **about 99 lines in `sheets/actor.ts`, 33 in `sheets/item.ts`, 21 in the initiative tracker and 13 in `odd-rpg.ts`**. `src/` contains no `declare module "fvtt-types/configuration"` or `declare global` merge at all. Code comments in the repo blame fvtt-types ("stubs don't model system.* dot-paths", "cast is unavoidable here"). The source shows that the needed hooks already exist:

- **`(game as any).combat` and `(game as any).keybindings`.** Both members are fully typed on `Game` ([game.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/game.d.mts)). The casts exist only because of the lifecycle union. Merge `interface AssumeHookRan { ready: never }`, or add `"fvtt-types/lenient"` to `types`, which does the same thing ([index-lenient.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/index-lenient.d.mts)). A stricter alternative is a `getGame()` guard ([wiki FAQ](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ)).
- **`(CONFIG as any).Actor.documentClass`.** Declare `DocumentClassConfig { Actor: typeof OddActor; Item: typeof OddItem }`, and add a `ConfiguredActor<SubType>` entry if the class is generic.
- **`TypeDataModel<any, Item.Implementation>`.** Pass the schema type (`ReturnType<typeof schema>`) and register each model in `DataModelConfig { Actor: { character: typeof CharacterModel }; Item: {...} }`. This also removes the `prepareDerivedData(this: any)` overrides.
- **`this.document.system as unknown as CharacterSystemData`.** Narrow with `if (this.actor.type === "character")` or `Actor.OfType<"character">`, and extend the sheet's `RenderContext` generic so `_prepareContext` returns a typed context ([actor-sheet.d.mts](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/client/applications/sheets/actor-sheet.d.mts)). If odd-rpg will never support module-added subtypes, `SystemConfig` with `moduleSubtype: "ignore"` trades some soundness for ergonomics.

`SettingConfig`, `FlagConfig` and `SystemNameConfig` type the rest of the surface the same way. A `declare global { interface CONFIG { ODD: typeof ODD } }` merge should cover `CONFIG.ODD`. That pattern is inferred from fvtt-types' own tests and has not been verified in detail.

What will likely remain after the merges: dot-path update keys such as `"system.hp.value"`, the Combatant generic bug, and genuinely dynamic registries. That is a small enough residue for justified `@ts-expect-error` comments. There is one caveat: nobody has compiled odd-rpg against either pin to measure how many casts actually disappear.

The deeper finding is about process. **CI runs `lint` and `vite build` but never `tsc --noEmit`, and Vite strips types without checking them.** Until a type-check gate exists, the strict tsconfig is advisory, and the escape count can only grow.

## Alternatives exist, but only pf2e-derived types are serious

There is no official types package. Foundry core is JSDoc-annotated JavaScript (with TS-5.5 `@import` syntax since 13.332), and the only official npm package is the CLI ([release 13.332](https://foundryvtt.com/releases/13.332); [npm foundryvtt-cli](https://www.npmjs.com/package/@foundryvtt/foundryvtt-cli)). DefinitelyTyped has no entry (`@types/foundry-vtt` returns "Not found").

The realistic alternative is **pf2e's hand-maintained `types/foundry` tree** (Apache-2.0). It has a branch per Foundry version, including `v13-dev`, which verifies against 13.351 ([pf2e tsconfig](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/tsconfig.json); [v13-dev system.json](https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/static/system.json)). Two npm packages republish it:

- **`@dfreds/foundry-types`** (v14 only, 14.366.1 from August 2026) adds patches, checks with `skipLibCheck` off and ships a NOTICE file ([README](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/README.md)).
- **`@7h3laughingman/foundry-types`** has a v13 line frozen at 13.351.20 since March 2026. It relicenses the pf2e content as MIT without attribution ([npm](https://registry.npmjs.org/@7h3laughingman/foundry-types)).

The catch is idiom. pf2e types use explicit generics (`Actor<TParent>`) and hand-redeclared `system` types, with far less inference from `defineSchema()`. Switching would mean rewriting how odd-rpg types every model. Coverage also follows pf2e's own needs: DFreds' changelog patches gaps such as an untyped `ActiveEffect#system` ([CHANGELOG](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/CHANGELOG.md)).

The remaining options are weaker. Types generated by running tsc over core are exact to the build but shallow: `@anandamideio/foundry-types` has un-parameterized fields such as `name: fields.StringField`, and its license is unclear. Redistributing core JSDoc text may also conflict with Foundry's license, so the `686d7066/fvtt-types` generator has users build the types locally ([npm @anandamideio/foundry-types](https://registry.npmjs.org/@anandamideio/foundry-types); [686d7066/fvtt-types](https://raw.githubusercontent.com/686d7066/fvtt-types/HEAD/README.md)). The JSDoc-against-local-install approach used by the JavaScript systems needs a licensed Foundry copy in every CI job and gives up strictness. `@illandril/foundryvtt-types` is a small hand-written subset, and `@vttforge/types` comes tied to its framework ([npm @illandril/foundryvtt-types](https://registry.npmjs.org/@illandril/foundryvtt-types)). **Verdict: stay on fvtt-types, pinned.** Keep pf2e `v13-dev` or `@dfreds/foundry-types` as a fallback in case the League project stalls.

## Platform stability: what the record says about maintenance cost

Planning for Foundry means planning for recurring migrations. Foundry's own writing makes this clear. In the 2021 Year in Review, its creator wrote that the 0.7 and 0.8 cycles meant migrations that "needed to handle hundreds of different changes," and that "we need to do this more incrementally" ([Year in Review 2021](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2021.html)). Recent majors kept that shape:
- v10 moved system data from `data.data` to `system` ([v10 migration guide](https://github.com/foundryvtt/foundryvtt/blob/master/articles/migration-guides/v10-data-model.html)).
- v12 removed compatibility shims ([#10164](https://github.com/foundryvtt/foundryvtt/issues/10164)).
- v13 brought ApplicationV2, Theme V2 and ESM, which Foundry described as migrations playing out "over the course of multiple major versions" ([Year in Review 2024](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2024.html)).
- v14 folded Measured Templates into Scene Regions ([#13089](https://github.com/foundryvtt/foundryvtt/issues/13089)).

Foundry's own telemetry shows how long the package ecosystem takes to catch up:

| Release | Snapshot age | Packages declaring support |
|---|---|---|
| v13 (2025) | ~1 month | 16% of modules |
| v14 (2026) | ~1.5 months | 1,590 of 5,338 modules (~30%); 144 of 475 systems (~30%) |

Sources: [Year in Review 2025](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2025.html), [Year in Review 2026](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2026.html). The snapshots were taken at different ages, so the rows are not directly comparable. Still, most packages trail a new major by months. Foundry now describes v14 as "one of our least-disruptive major generation upgrades yet" and says it is heading toward "an era of long-term stability." It also warns of "speed-bumps ahead… as previously committed deprecations (like Application V1) become enforced" ([Year in Review 2026](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2026.html)). Treat the stability commitment as a direction, and keep budgeting migration time per major.

**The supported surface is explicit, and it is shrinking on purpose.** Foundry's versioning policy separates a Public API, which gets deprecation periods, from a Private API. The Private API gets "no deprecation periods or compatibility layers" and may break "at any point… including during the Stable phase" (search snippet, [Versioning and Releases](https://foundryvtt.com/article/versioning/)). Core increasingly enforces this with true `#private` members. For example, v11 made `MouseInteractionManager._handleMouseDown` private, which broke a module that overrode it ([#9562](https://github.com/foundryvtt/foundryvtt/issues/9562)). Some such requests are accommodated: a `CombatTracker` subclassing problem was fixed for v13 ([#11976](https://github.com/foundryvtt/foundryvtt/issues/11976)). Deprecation removals run about two majors behind, and some items have been extended to v16 ([#13436](https://github.com/foundryvtt/foundryvtt/issues/13436)). Where core behaviour has to change, the ecosystem standard is [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper), which puts ordering and conflict handling on top of what would otherwise be raw monkey-patching.

**The client source is readable and licensed for package development.** Client code has shipped un-minified since 2019 ([#739](https://github.com/foundryvtt/foundryvtt/issues/739)). Since 13.338 it has shipped as per-class ES modules (search snippet, [Release 13.338](https://foundryvtt.com/releases/13.338)). The API docs are generated from the same JSDoc. Server code is not part of the extension surface; packages build on the client. The EULA includes a "Limited License for Package Development" that lets packages reference or copy core code only where strictly necessary and only for use with a licensed copy (search snippet, [Software License](https://foundryvtt.com/article/license/)). Two things follow for tooling. Reading the local install's source is the most reliable documentation. Redistributing declarations generated from core is legally murkier than using hand-written community typings.

**Core absorbs generic features over time.** Examples include Scene Levels in v14 (which replaced the Levels module), Scene Regions (which covered much of Monk's Active Tiles), and drag measurement in v13 (search snippet, [Release 13.341](https://foundryvtt.com/releases/13.341)). Foundry announces these ahead of time, often after patron votes ([Year in Review 2025](https://github.com/foundryvtt/foundryvtt/blob/master/articles/year-in-review-2025.html)). For a system, the practical point is to put its value in game-specific rules logic, which core has no reason to replace, rather than in generic tabletop utilities such as calendars, levels or measurement.

**Early-warning channels exist.** Foundry's Prototype and Development builds target developers who want to help shape the Public API (search snippet, [Versioning](https://foundryvtt.com/article/versioning/)). Breaking changes are tracked as labelled issues and migration discussions on [GitHub](https://github.com/foundryvtt/foundryvtt/discussions). v14 also began deprecating `template.json` in favour of DataModels ([#13429](https://github.com/foundryvtt/foundryvtt/issues/13429)), and odd-rpg already uses DataModels.

## Steer development with contracts, a compat seam and a version matrix

**Version policy comes first because it decides which types you can use.** fvtt-types maintains only v14. dnd5e and Daggerheart already require v14 ([dnd5e system.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/system.json); [Daggerheart system.json](https://raw.githubusercontent.com/Foundryborne/daggerheart/main/system.json)). odd-rpg's exposure to v14 changes is small. It has no Active Effect code, no MeasuredTemplate, no `<details>`, no `prepareBaseData` override, and no `_insertElement`/`_replaceHTML` override. Moving to `compatibility: {minimum: 13, verified: 14}` is therefore cheap, and so is moving to v14-only one release later. Never set `maximum`, because it is a hard block: `maximum: 13` refuses to load in v14 ([v14 migration guide (community)](https://github.com/mordachai/vagabond/blob/main/FOUNDRY_V14_MIGRATION.md)). Write any new Active Effect work in the v14 shape from the start (`system.changes`, string change `type`), and always call `super` in `prepare*` overrides. A skipped `super.prepareBaseData()` breaks v14's AE phase tracking. Foundry removes deprecated APIs after roughly two major versions and gives private `_` methods no protection at all ([foundryvtt#11815](https://github.com/foundryvtt/foundryvtt/issues/11815); [migration guides](https://foundryvtt.com/article/migration/)). The steelman for staying on v13 is that Cosmere RPG does, and pf2e still maintains `v13-dev`. But staying means frozen types with no backports. Only do it if your players are pinned to v13.

**Extensibility should come from contracts, not a framework.** Follow dnd5e:

- Publish one namespaced API object (`globalThis.odd = { config, dataModels, documents, applications, dice, utils, migrations }`, merged into `game.system`).
- Register models centrally via `CONFIG.<Doc>.dataModels`.
- Fire namespaced hooks at real extension points, for example `odd.preRoll`/`odd.roll` and `odd.ready` ([dnd5e.mjs](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs)).
- Read rules constants from `CONFIG.ODD` at use time, never through a direct import. A module can then add a skill in `setup` and have it appear in sheets, rolls and AE keys.
- Keep stored fields in `defineSchema` and computed totals in `prepareDerivedData`, so Active Effects can target either.
- Give each ApplicationV2 PART its own `_preparePartContext` branch, so new parts don't touch existing ones.
- Treat hook names, payloads and the API object as a semver contract: changing them requires `feat!`. Record each such decision in a short ADR.

**Isolate version-sensitive code in `src/compat/`.** This covers namespaced-versus-global lookups, AE change-type readers and any override of core behaviour. Do not use `_`-prefixed or `#private` members. When an override can't be avoided, register it through libWrapper from this one folder, so each major-version audit only has to cover that folder. Pair it with a two-layer migration scheme:

- Lazy `static migrateData` on each model for field reshapes.
- A GM-only world migration in `ready`, gated by a `migrationVersion` setting and `flags.needsMigrationVersion` in the manifest, the way dnd5e gates its own ([dnd5e.mjs](https://github.com/foundryvtt/dnd5e/blob/master/dnd5e.mjs)).

Keep compendium sources as JSON or YAML in git and compile them with `@foundryvtt/foundryvtt-cli`'s `compilePack`/`extractPack` ([foundryvtt-cli README](https://github.com/foundryvtt/foundryvtt-cli/blob/main/README.md)).

**Test in three layers.** Most value sits in the cheapest one:

- **Vitest over pure rules functions.** Move dice math, wound and strain thresholds and initiative ordering into functions that take `CONFIG.ODD` as a parameter.
- **Quench contract tests inside Foundry.** Create each actor type, check derived data, apply each AE change type and render each sheet ([FVTT-Quench](https://github.com/Ethaks/FVTT-Quench)).
- **A felddy Docker matrix.** Run the Quench suite against the `minimum` and `verified` builds, with `CONFIG.debug.compatibility` set to FAILURE so deprecations fail CI ([felddy #1385](https://github.com/felddy/foundryvtt-docker/discussions/1385)). Add a weekly, allowed-to-fail job against the next Testing build. That gives early warning of v15, which Foundry says will start once v14 and a non-breaking "14.5" are done ([Year in Review 2026](https://foundryvtt.com/article/year-in-review-2026/)).

To reduce day-to-day friction, add `flags.hotReload` for css/hbs/json and gate half-built features behind hidden `odd.experimental.*` settings so they can merge to main without long-lived branches ([hotReload hook](https://foundryvtt.com/api/functions/hookEvents.hotReload.html)).

### Prioritized action list for odd-rpg

| # | Action | Effort | Why now |
|---|---|---|---|
| 1 | Replace `fvtt-types#main` with an exact pin: `#62d191af61487e0dca54d716bc18197dc009a7ea` (final v13) now | Minutes | Stops a silent v13→v14 type jump on the next lockfile refresh |
| 2 | Add `tsc --noEmit` to CI and lint-staged; make `no-explicit-any` an error with a ratcheting baseline | Hours | Makes the strict tsconfig real; blocks new escapes |
| 3 | Add `src/types/fvtt-config.d.ts` with `AssumeHookRan`, `DocumentClassConfig`, `DataModelConfig`, `SettingConfig`, a `CONFIG.ODD` merge; type each model's schema generic; narrow sheets by `actor.type` | 1–2 days | Removes most of the ~194 casts, starting in `sheets/actor.ts` |
| 4 | Set manifest to `minimum: 13, verified: 14`, then move to v14-only with `fvtt-types@14.366.0-beta.<ts>` pinned exactly; run `vttforge audit` once as a readiness check | 1–2 days | Only v14 types are maintained; odd-rpg's v14 exposure is low |
| 5 | Add `flags.hotReload`, `packs` plus a foundryvtt-cli compile/unpack step, and a migration runner (`migrateData` + versioned world migration) | 1 day | Cheap now, expensive after users have data |
| 6 | Publish the `globalThis.odd` API, namespaced hooks and a `src/compat/` module (libWrapper for any unavoidable core override); read all rules constants from `CONFIG.ODD` | 1–2 days | Makes features and third-party modules additive |
| 7 | Extract pure rules into Vitest-tested functions; add Quench contract tests and a felddy v13/v14 CI matrix; track Prototype/Development builds and `breaking`-labelled core issues | 2–3 days | Catches regressions and deprecations before each Foundry bump |
| 8 | Upgrade to Vite 8 and adopt `vite-plugin-foundryvtt` for HMR and packs | Hours | Faster edit loop; the plugin requires Vite 8 |

## Conclusion

odd-rpg's question was framed as "what should we port onto". The answer is to make the stack it already has enforceable. The ecosystem in 2026 has converged on vanilla ApplicationV2, Handlebars and TypeDataModel, and the frameworks that tried to abstract over it are either stalled (TRL) or too young to bet on (VTTForge). The leverage is in the types. fvtt-types can now infer almost everything a system needs from `defineSchema()`, but only if the system declares its configuration and a type-checker actually runs. odd-rpg has done neither, so its casts measure setup debt, not library gaps.

The version question and the types question are one decision. Because fvtt-types maintains only the current Foundry major and publishes only betas, "strongly typed" in practice means "pinned to an exact beta and upgraded together with the manifest". Treat the types pin, `system.json` compatibility and the CI Foundry matrix as a single versioned unit that moves in one PR per Foundry major. Future upgrades, including v15, then become a planned change instead of a surprise.
