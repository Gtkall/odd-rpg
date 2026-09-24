# Foundry VTT-specific opinionated frameworks, libraries and scaffolds (state as of 2026-09-23)

Method note: foundryvtt.com, en.wikipedia.org and foundryvtt.store were blocked by the research sandbox's egress proxy, so Foundry release facts come from search-result snippets of foundryvtt.com release pages plus third-party mirrors (Forge blog, felddy docker). The GitHub REST API was also blocked; repo facts come from raw.githubusercontent.com files (package.json / system.json on default branches, fetched 2026-09-23), GitHub web pages via fetch, and the npm registry JSON (registry.npmjs.org, which carries exact publish timestamps).

## 1. Foundry platform baseline (v13 / v14 / latest as of Sept 2026)

### Takeaway
Foundry v14 is the current stable generation (first stable 14.359, spring 2026; latest stable 14.368, ~2026-09-20). I found no public v15 builds. The big reference systems (dnd5e, Daggerheart) already require v14, so odd-rpg's v13-only manifest is one major version behind whatever framework is chosen.

### Cited Findings
- 14.359 was "the very first Stable release" of v14. It was "deliberately modest in scope," and Scene Levels is the flagship v14 feature. — [Foundry release 14.359 (search snippet)](https://foundryvtt.com/releases/14.359)
- The Forge rolled out v14 in April 2026. Per the search snippet, it listed v14.364 as the stable release as of June 10, 2026. — [Forge blog: V14 is out on The Forge](https://blog.forge-vtt.com/v14-is-out-on-the-forge/); [Forge April 2026 developer update](https://blog.forge-vtt.com/april-2026-developer-update/)
- Developer-relevant v14 features named in search snippets: native pop-out of apps into separate browser windows, removal of TinyMCE in favour of ProseMirror, and richer Active Effects (expiration control, ability to alter tokens). — [Forge blog](https://blog.forge-vtt.com/v14-is-out-on-the-forge/); [foundryvtt.store v14 news (snippet only; page blocked)](https://www.foundryvtt.store/news/2026-04-01-foundry-vtt-v14)
- 14.365 fixed `ApplicationV2#renderChild` leaving a blank window after reattaching a detached window, and added `ApplicationV2#_refit` so apps can control when their host window refits. This shows that ApplicationV2 is still getting API work in v14. — [Foundry release 14.365 (snippet)](https://foundryvtt.com/releases/14.365)
- 14.368 is "Version 14 Stable 10": bugfixes, minor UI/API improvements, and performance work. — [Foundry release 14.368 (snippet)](https://foundryvtt.com/releases/14.368)
- The felddy/foundryvtt-docker image for stable 14.368 was released on "September 20" (2026 implied by sequence). The page does not mention v15. — [felddy/foundryvtt-docker v14.368.0](https://github.com/felddy/foundryvtt-docker/releases/tag/v14.368.0)
- The official v14 API docs still document `HandlebarsApplicationMixin` / ApplicationV2 as the core UI API. — [Foundry API v14: foundry.applications.api](https://foundryvtt.com/api/modules/foundry.applications.api.html)
- fvtt-types (League of Foundry Developers) npm `latest` tag = `13.346.0-beta.20250812191140`, published 2025-08-12. The `beta` tag = `14.366.0-beta.20260922013222`, published 2026-09-22, so v14 types exist but only as a beta channel. — [npm registry: fvtt-types](https://registry.npmjs.org/fvtt-types) / [npm page](https://www.npmjs.com/package/fvtt-types)
- The official `@foundryvtt/foundryvtt-cli` latest is 3.0.4, published 2026-07-01. — [npm: @foundryvtt/foundryvtt-cli](https://www.npmjs.com/package/@foundryvtt/foundryvtt-cli)

### Inferences
- Any port should also plan the v13→v14 move. Tooling released in 2026 (VTTForge, below) targets v14 only.
- Core v14 did not add a reactive or virtual-DOM templating layer that I could find. Handlebars + ApplicationV2 PARTS is still the first-party path, so the "framework" question is still a question about third-party packages.

### Gaps
- Could not read the full foundryvtt.com release notes (egress blocked), so I could not list the complete v14 ApplicationV2 changes.
- No evidence found of a v15 prototype or development build or a public roadmap by Sept 2026. "None exists" is unconfirmed.

## 2. TyphonJS Runtime Library (TRL) / Svelte stack

### Takeaway
TRL (Michael Leahy / TyphonJS) is still maintained, with commits as recent as 2026-08-30. It is stuck on Svelte 4 (peer dependency `svelte >=4 <5`) and Foundry v13 (manifest min/verified 13), and it has not had a stable npm release since 0.2.0 (Feb 2025). I found no successor project. For a new port in 2026 it is a high-risk choice.

### Cited Findings
- npm `@typhonjs-fvtt/runtime`: `latest` = 0.2.0 (published 2025-02-16), `next` = 0.3.0-next.4 (published 2025-10-11). Prior prereleases: 0.3.0-next.1/2 (2025-05-15), next.3 (2025-08-16). — [npm registry: @typhonjs-fvtt/runtime](https://registry.npmjs.org/@typhonjs-fvtt/runtime); [npm page](https://www.npmjs.com/package/@typhonjs-fvtt/runtime)
- The peerDependencies of both 0.2.0 and 0.3.0-next.4 include `svelte: ">=4.x.x <5"` and `@sveltejs/vite-plugin-svelte: ">=3.x.x <4"`. So there is **no Svelte 5 support** in any published version. Current Svelte is 5.57.1 (2026-09-18) and vite-plugin-svelte is 7.3.0. — [npm registry: @typhonjs-fvtt/runtime](https://registry.npmjs.org/@typhonjs-fvtt/runtime); [npm: svelte](https://www.npmjs.com/package/svelte)
- The underlying `@typhonjs-svelte/runtime-base` package.json (main, version 0.3.0) also pins `svelte: ">=4.x.x <5"`. — [runtime-base package.json](https://raw.githubusercontent.com/typhonjs-svelte/runtime-base/main/package.json)
- On the TRL main branch, package.json version is 0.3.0-next.4, license MPL-2.0, built with Rollup and TypeScript 6.0.3. Its module manifest has compatibility `{minimum: "13", verified: "13"}`, which means no v14 verification. — [typhonjs-fvtt-lib/runtime package.json](https://raw.githubusercontent.com/typhonjs-fvtt-lib/runtime/main/package.json); [TRL module.json](https://raw.githubusercontent.com/typhonjs-fvtt-lib/runtime/main/module.json)
- Recent commits: 2026-08-30 "Update dependencies", 2026-07-26, 2026-07-23 (added `#runtime/util/types`), 2026-07-13, 2026-07-11. Before those there is a gap back to 2025-11-20. None of the recent commit messages mention Svelte 5 or v14. — [TRL commits](https://github.com/typhonjs-fvtt-lib/runtime/commits/main)
- The README calls TRL a "beta release" and says type declarations and documentation for all Svelte components are still in progress. The repo has about 18 stars and 385 commits. — [typhonjs-fvtt-lib/runtime](https://github.com/typhonjs-fvtt-lib/runtime)
- TRL describes itself as "an integrated library and framework for creating modern Svelte powered packages." It provides reactive "application shells", transitions, context menus, a modal Dialog, and a Svelte component library (`@typhonjs-fvtt/svelte-standard`). The API docs are titled "TyphonJS Runtime Library (FVTT) 0.3.0". — [TRL API docs](https://typhonjs-fvtt-lib.github.io/api-docs/index.html); [typhonjs-fvtt-lib/standard](https://github.com/typhonjs-fvtt-lib/standard)
- `@typhonjs-fvtt/svelte-standard` latest is 0.1.0 (published 2023-07-10), with peer dependency `svelte >=4`. — [npm registry: @typhonjs-fvtt/svelte-standard](https://registry.npmjs.org/@typhonjs-fvtt/svelte-standard)
- Starter template and demos: template-svelte-esm and essential-svelte-esm. — [template-svelte-esm](https://github.com/typhonjs-fvtt-demo/template-svelte-esm); [essential-svelte-esm](https://github.com/typhonjs-fvtt-demo/essential-svelte-esm)

### Inferences
- Bus factor ≈ 1 (a single author org). There has been no stable release for 19 months, and Svelte 4 is now two-plus years behind Svelte 5 runes. Adopting TRL means porting onto a legacy Svelte API and a runtime that is not yet v14-verified.
- TRL replaces ApplicationV2 + Handlebars with its own SvelteApp/shell abstraction. Migration cost for odd-rpg would be a rewrite of every sheet, the initiative tracker, and the styles.
- MPL-2.0 is file-level copyleft. It is fine for use as a dependency, but modified TRL files must stay MPL.

### Gaps
- I did not find any public statement from the author about Svelte 5 plans or a successor. The absence of evidence is not confirmation.

## 3. Other UI-framework integrations with ApplicationV2 (Vue, Svelte 5, Solid, React, Lit)

### Takeaway
No non-Handlebars integration is a mature, broadly adopted framework. The most prominent real-world Svelte 5 user is PF2e, which uses its own in-repo integration and does not publish a library. Vue has one small community mixin (fvtt-vue). SolidJS has a brand-new adapter (Aug 2026). I found no maintained React or Lit adapter.

### Cited Findings
- **Vue**: mouse0270/fvtt-vue provides `VueApplicationMixin`, "a Mixin that can be used as a Replacement for Foundry's `HandlebarsApplicationMixin`". It uses Vue 3 via the "Vue3 SFC Loader" and is MIT licensed. The repo has 12 commits, no stated Foundry version support and no TypeScript mentioned. It is also listed as a Foundry package, "Foundry Vue". — [mouse0270/fvtt-vue](https://github.com/mouse0270/fvtt-vue); [Foundry package: Foundry Vue](https://foundryvtt.com/packages/00-foundry-vue)
- **Svelte 5 (in-repo, no library)**: the PF2e system's package.json has dependencies `svelte ^5.20.5`, `svelecte ^5.1.4`, `handlebars 4.7.8`, and dev dependencies `@sveltejs/vite-plugin-svelte ^5.0.3`, `vite ^6.2.0`, `svelte-preprocess`, `prettier-plugin-svelte`. That makes it a hybrid Handlebars + Svelte 5 codebase built with Vite. License is Apache-2.0. — [foundryvtt/pf2e package.json](https://raw.githubusercontent.com/foundryvtt/pf2e/master/package.json)
  - Caveat: the `static/system.json` on the PF2e `master` branch reports compatibility min 12.328, verified 12.331, max 12, which contradicts the system's known v13-era releases. The default branch is probably not the release branch, so treat PF2e version data as unverified. — [pf2e static/system.json](https://raw.githubusercontent.com/foundryvtt/pf2e/master/static/system.json)
- Community Svelte-in-Foundry examples that are not frameworks: Haxxer/FoundryVTT-Svelte-Tests and kgar/svelte-in-foundry-example ("a quick, messy example of getting svelte (with TypeScript) to work"). There is also a blog walkthrough. — [Haxxer/FoundryVTT-Svelte-Tests](https://github.com/Haxxer/FoundryVTT-Svelte-Tests); [kgar/svelte-in-foundry-example](https://github.com/kgar/svelte-in-foundry-example); [Foundry VTT + Svelte + TypeScript blog](https://iamven.page/blog/FoundryVTT+Svelte+TS/)
- **SolidJS**: `@phillip-best/foundry-solid-adapter` ("a reusable substrate for building Foundry VTT interfaces in SolidJS"), first published 2026-08-06, latest 0.3.2 on 2026-08-12, 6 versions, peer dependency `solid-js ^1.9.0`, MIT, single maintainer. The companion `@phillip-best/foundry-build-tools` 0.2.0 (2026-08-12) is Vite tooling with peer dependency `vite ^6||^7||^8`. — [npm registry: @phillip-best/foundry-solid-adapter](https://registry.npmjs.org/@phillip-best/foundry-solid-adapter); [GitHub Pjb518/foundry-solid-adapter](https://github.com/Pjb518/foundry-solid-adapter); [npm registry: @phillip-best/foundry-build-tools](https://registry.npmjs.org/@phillip-best/foundry-build-tools)
- **ApplicationV2 opinionated extensions (still Handlebars)**: dylanpiera/foundry-applicationv2-expanded provides `ApplicationV2Expanded`, `DocumentSheetV2Expanded`, `ActorSheetV2Expanded` and `ItemSheetV2Expanded`, plus drag-drop, tab and AppV1-header-button mixins. It is plain .mjs, MIT, 7 commits, 1 star. — [dylanpiera/foundry-applicationv2-expanded](https://github.com/dylanpiera/foundry-applicationv2-expanded)
- `@revolutionarygamesco/common-foundryvtt` 0.6.0 (2026-08-22, GPL-3.0-or-later) ships `TabbedActorSheet` / `TabbedItemSheet`, utilities, Vitest mocks, and its **own** Foundry TypeScript types "verified as of v14". The README says these types are "incompatible with ... fvtt-types". — [npm registry: @revolutionarygamesco/common-foundryvtt](https://registry.npmjs.org/@revolutionarygamesco/common-foundryvtt)
- Community wiki guidance for ApplicationV2 (conversion guide and API page) remains Handlebars-centred. — [Foundry wiki: ApplicationV2](https://foundryvtt.wiki/en/development/api/applicationv2); [Foundry wiki: ApplicationV2 Conversion Guide](https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide)

### Inferences
- A senior engineer could write a thin `SvelteApplicationMixin` (Svelte 5 `mount`/`unmount` inside `_renderHTML`/`_replaceHTML`) in a few hundred lines, following the PF2e pattern. That would carry less risk than depending on fvtt-vue, the Solid adapter, or TRL, all of which are maintained by one person.
- @revolutionarygamesco/common-foundryvtt conflicts directly with odd-rpg's fvtt-types setup (it replaces the global `foundry` types) and is GPL-3.0, so it is a poor fit.

### Gaps
- I could not verify whether Draw Steel, Daggerheart (Foundryborne) or Cosmere RPG use Vue or Svelte. Their package.json files show no Vue or Svelte dependency (see section 5), which suggests they are Handlebars-based.
- No React or Lit/web-component ApplicationV2 adapter was found on npm (searched "foundryvtt react", "foundry vtt vue", "foundry vtt applicationv2", keyword:foundryvtt).
- I did not verify which other published systems use Svelte (e.g., Lancer, whose package.json failed to parse from `master`; Tidy5e is a module, not a system).

## 4. Scaffolds, templates, generators, build plugins

### Takeaway
The standout 2026 entrant is **VTTForge**: an MIT, TypeScript-first SDK + CLI + Vite plugin for v14+ systems. It keeps ApplicationV2 + Handlebars and TypeDataModel but adds typed-schema inference, `registerSystem`, base sheets, a v13→v14 migrator and an audit linter. It is very young (first published May 2026) and has one maintainer. Older scaffolds such as asacolips' Boilerplate are stale on their default branch. `vite-plugin-foundryvtt` is a focused, maintained Vite HMR/proxy plugin that fits odd-rpg's current Vite setup.

### Cited Findings
- **VTTForge** (github.com/vttforge/vttforge): "An SDK and CLI for building Foundry VTT v14+ systems and modules", MIT, about 11 stars and 274 commits. It claims "zero lock-in. The output is plain `.mjs` that Foundry loads natively." — [vttforge/vttforge](https://github.com/vttforge/vttforge)
  - `@vttforge/cli` 0.18.8 (2026-09-14; first published 2026-05-05; 35 versions; single npm maintainer "fabriciosx"). Commands: `init` (system-ts/system-js/module-ts/module-js templates), `dev` (links dist into Foundry Data and live-reloads templates/CSS via the `@vttforge/dev-module` companion), `build` (zip with top-level manifest), `lint` (bundled Biome), `audit` (checks for v14 silent breakages, e.g. `flags.hotReload` shape, `TypeDataModel` without `prepareBaseData`, `{{#select}}`, `-=` update keys, numeric Active Effect modes), and `migrate` (rewrites a v13 project for v14, including the manifest `compatibility`). — [npm registry: @vttforge/cli](https://registry.npmjs.org/@vttforge/cli)
  - `@vttforge/core` 0.20.7 (2026-09-14): `registerSystem`/`registerModule` replace the `Hooks.once("init")` block (data models, document classes, initiative, status effects, sheets, enrichers). `BaseTypeDataModel(defineSchema)` gives typed fields (`InferSchema<T>`). `BaseActorSheet()`/`BaseItemSheet()` add `static TABS`, `DRAG_DROP`, and play/edit `MODES` on ActorSheetV2/ItemSheetV2 **with Handlebars**. Also `resourceField()`, `postRoll()`, dice-pool helpers, `promptFields()`, and keyword enrichers. — [npm registry: @vttforge/core](https://registry.npmjs.org/@vttforge/core)
  - Other packages (all published 2026-09-14 unless noted): `@vttforge/types` 0.11.1 (its own typed Foundry surface), `@vttforge/vite-plugin` 0.6.1 ("browser ESM output with no hashing"), `@vttforge/styles` 0.5.1 (CSS design system), `@vttforge/testing` 0.14.2 (Vitest mocks + Quench helpers), `@vttforge/dev-module` 0.2.5 (2026-09-10), `create-vttforge` 0.3.39. — [npm search keyword:foundryvtt](https://registry.npmjs.org/-/v1/search?text=keywords:foundryvtt&size=25); [npm: create-vttforge](https://www.npmjs.com/package/create-vttforge)
- **vite-plugin-foundryvtt** (Codeberg, Bolts): 3.0.0 (2026-03-28), first published 2025-01-27, 14 versions, MIT. Peer dependencies: `vite ^8`, `@foundryvtt/foundryvtt-cli ^1||^2||^3`, `classic-level`. It "bridges ... vite's hotUpdate to work with foundry's hotReload, build[s] configured compendium packs and rewrite[s] the manifest with basic substitutions". The README example proxies `localhost:30000` and socket.io behind the Vite dev server. — [npm registry: vite-plugin-foundryvtt](https://registry.npmjs.org/vite-plugin-foundryvtt); [codeberg.org/Bolts/vite-plugin-foundryvtt](https://codeberg.org/Bolts/vite-plugin-foundryvtt)
- **asacolips Boilerplate** (the de facto tutorial scaffold): on `main`, package.json version 2.0.0 (MIT) and system.json compatibility `{minimum: 11, verified: "11.315"}`. The default branch is stale (v11-era). — [asacolips-projects/boilerplate package.json](https://raw.githubusercontent.com/asacolips-projects/boilerplate/main/package.json); [boilerplate system.json](https://raw.githubusercontent.com/asacolips-projects/boilerplate/main/system.json)
- **Official Foundry CLI** `@foundryvtt/foundryvtt-cli` 3.0.4 (2026-07-01): the standard compendium pack/unpack tool. Draw Steel (^3.0.0), dnd5e (^3.0.4), Daggerheart (^1.0.2) and Cosmere (^1.0.3) all depend on it. — [npm](https://www.npmjs.com/package/@foundryvtt/foundryvtt-cli); [dnd5e package.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/package.json)
- Other 2026 single-maintainer tooling:
  - `@heroiclands/package-build` 22.5.1 (2026-09-23, GPL-3.0-or-later, 69 versions since 2026-08-22): a manifest/stage/lang/pack/release toolchain built for the HeroicLands packages. — [npm registry](https://registry.npmjs.org/@heroiclands/package-build)
  - `@thefehr/foundry-playwright` 1.4.4 (2026-09-21, MIT): E2E testing with V13/V14 adapters and Docker orchestration. — [npm registry](https://registry.npmjs.org/@thefehr/foundry-playwright)
  - `@zuedev/create-foundry-module` 0.1.0 (2026-09-12): scaffolds a zero-build **module**, not a system. — [npm search](https://registry.npmjs.org/-/v1/search?text=create%20foundry&size=10)
  - `@rayners/foundry-dev-tools` 1.6.1 (2025-08-14) and `@rayners/foundry-test-utils` 1.2.2 (2025-12-07). — [npm search keyword:foundryvtt](https://registry.npmjs.org/-/v1/search?text=keywords:foundryvtt&size=25)
- `@ethaks/fvtt-quench` 0.10.0 (2025-04-30) provides types for the Quench in-Foundry Mocha/Chai test module. Cosmere RPG uses it. — [npm search keyword:foundryvtt](https://registry.npmjs.org/-/v1/search?text=keywords:foundryvtt&size=25); [cosmere-rpg package.json](https://raw.githubusercontent.com/the-metalworks/cosmere-rpg/main/package.json)

### Inferences
- VTTForge is the only thing found that is literally "an opinionated Foundry system framework you could port onto" while keeping odd-rpg's architecture: TypeDataModel, ActorSheetV2/ItemSheetV2, Handlebars, enrichers, custom documents and Vite. Migration cost is plausibly low-to-moderate: rewrap the init hook in `registerSystem`, rebase models onto `BaseTypeDataModel`, rebase sheets onto `BaseActorSheet`, and run `vttforge migrate` for v14.
- VTTForge also has real risks:
  - It ships its own `@vttforge/types`, which may clash with fvtt-types (unverified).
  - It forces v14+.
  - It is pre-1.0, with 30+ releases in about 4 months, so expect churn.
  - It has a single npm maintainer, so bus factor is 1.
  - It bundles Biome and Bun-first docs, which may conflict with existing ESLint/Prettier/semantic-release choices.
- A cheaper intermediate option: keep the current code and add `vite-plugin-foundryvtt` for HMR/proxy/pack building. Optionally run `vttforge audit` as a one-off v14 readiness check without adopting the runtime.

### Gaps
- Not verified: how VTTForge types interoperate with fvtt-types, and whether any published system uses VTTForge in production.
- The League of Foundry Developers "FoundryVTT-System-Template" repo could not be checked (GitHub API blocked; no raw package.json found), so its status is unknown.
- Could not confirm whether asacolips' Boilerplate has a newer v13/v14 ApplicationV2 branch.

## 5. Reference-architecture systems as de facto frameworks (dnd5e, pf2e, Draw Steel, Daggerheart, Cosmere, Lancer, SWADE)

### Takeaway
All the major reference systems examined use vanilla Foundry APIs (TypeDataModel, ApplicationV2 + Handlebars) built with Rollup, and none publishes a reusable npm framework. PF2e is the exception on the UI layer (Svelte 5 + Vite, in-repo). Their value to odd-rpg is as pattern libraries to copy, not dependencies.

### Cited Findings
- **dnd5e** (official, foundryvtt org): system.json v6.0.5, compatibility `{minimum: "14.367", verified: "14"}`. Build dev dependencies are only `@foundryvtt/foundryvtt-cli`, `@rollup/plugin-node-resolve` and `rollup`: no UI framework and no TypeScript. — [dnd5e system.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/system.json); [dnd5e package.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/package.json)
- **Daggerheart (Foundryborne)**: system.json v2.10.5, compatibility `{minimum: "14.364", verified: "14.368", maximum: "14"}`. Dev dependencies: rollup, rollup-plugin-postcss, foundryvtt-cli ^1.0.2, `typescript ^6.0.3` + typescript-eslint. No Vue or Svelte. — [Foundryborne/daggerheart package.json](https://raw.githubusercontent.com/Foundryborne/daggerheart/main/package.json); [system.json](https://raw.githubusercontent.com/Foundryborne/daggerheart/main/system.json)
- **Draw Steel (MetaMorphic Digital)**: `main` system.json 0.10.2 and `develop` 0.11.1, both `{minimum: "13.351", verified: "13"}`. Dev dependencies: rollup, rollup-plugin-import-css, foundryvtt-cli ^3, typescript ^5.8.3 (for checking). No UI framework. — [draw-steel package.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/main/package.json); [draw-steel develop system.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/develop/system.json)
- **Cosmere RPG (the-metalworks)**: v3.1.0, `{minimum: "13.346", verified: "13.351", maximum: "13"}`. It is the closest analogue to odd-rpg's toolchain: full TypeScript built with `@rollup/plugin-typescript`, `@league-of-foundry-developers/foundry-vtt-types ^13.346.0-beta.20250908011144`, SCSS, and Quench tests. No Vue or Svelte. — [cosmere-rpg package.json](https://raw.githubusercontent.com/the-metalworks/cosmere-rpg/main/package.json); [cosmere-rpg src/system.json](https://raw.githubusercontent.com/the-metalworks/cosmere-rpg/main/src/system.json)
- **PF2e**: Svelte 5 + Vite + TypeScript + Handlebars hybrid, Apache-2.0. See section 3 for the branch/version caveat. — [pf2e package.json](https://raw.githubusercontent.com/foundryvtt/pf2e/master/package.json)

### Inferences
- The established patterns to copy are:
  - A `TypeDataModel` hierarchy with shared base/template mixins (dnd5e, Draw Steel, Cosmere).
  - CONFIG registries for types and sheets.
  - ApplicationV2 `static PARTS` + `TABS`.
  - Rollup or Vite builds with foundryvtt-cli for packs.

  odd-rpg already follows this shape, so "porting onto a framework" gives less than it would for a v1-API codebase.
- Cosmere RPG is the best TypeScript + fvtt-types reference, and it is still on v13 as of its `main` manifest.

### Gaps
- Lancer (massif-press) and SWADE were not verified: Lancer's manifest/package.json could not be parsed from the branches tried, and SWADE was not checked.
- Last-commit dates for these repos could not be retrieved (GitHub API and atom feeds blocked). Activity is inferred only from manifest versions and v14 compatibility.

## 6. No-code / low-code system builders (Sandbox, Simple Worldbuilding, Custom System Builder)

### Takeaway
Not researched in depth within the tool budget. These are user-facing, in-Foundry builders and are not a fit for a code-first, strict-TypeScript, semantic-released system.

### Cited Findings
- No sources gathered in this pass.

### Inferences
- Based on general design, not verified here: these builders are themselves game systems that users configure inside Foundry. Porting odd-rpg onto one would mean giving up the codebase (TypeScript, custom Document classes, enrichers, the custom initiative tracker) in exchange for runtime-configured templates. That is the opposite of what a senior engineer wants.

### Gaps
- Current maintenance status and v14 support for Sandbox System Builder, Simple Worldbuilding and Custom System Builder were not verified.
