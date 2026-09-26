# Alternatives to fvtt-types (League of Foundry Developers) for Foundry VTT TypeScript types — as of 2026-09-23

Method note: npm registry metadata was pulled directly from `registry.npmjs.org` (dates below are npm publish timestamps). GitHub files were read from `raw.githubusercontent.com` and `git ls-remote`. foundryvtt.com, foundryvtt.wiki and foundryvtt.store were **blocked by this environment's egress proxy**, so no official Foundry page could be read directly; claims about them come only from search-result snippets and are flagged. Every package listed here was confirmed to exist on npm or GitHub. Names that were checked and **do not exist** on npm: `@types/foundry-vtt`, `@types/foundryvtt`, `@types/foundry` (registry returned "Not found").

## 0. Context: state of the incumbent (fvtt-types) — needed to judge the alternatives

### Takeaway
fvtt-types is still "beta" for v13. Its GitHub `main` branch has **moved to Foundry v14** (package.json `14.366.0`). No v13 branch exists. odd-rpg's `github:...#main` dependency will therefore resolve to v14 types on a fresh install or lockfile update. The current lockfile still pins a 13.346.0 commit.

### Cited Findings
- The README says v0.7, 0.8 and 9 are fully supported, 10–12 partially, and v13 is "in beta with known bugs, issues in the ergonomics, and unfinished work". It recommends installing v13 via `npm add -D fvtt-types@github:League-of-Foundry-Developers/foundry-vtt-types#main`. — [GitHub README](https://github.com/League-of-Foundry-Developers/foundry-vtt-types)
- `main` branch package.json version is now `14.366.0`. — [raw package.json](https://raw.githubusercontent.com/League-of-Foundry-Developers/foundry-vtt-types/main/package.json)
- Branch list (git ls-remote): `main`, `v12`, `foundry-0.7.x`, `foundry-0.8.x`, plus feature branches. There is **no v13 branch**. — [repo](https://github.com/League-of-Foundry-Developers/foundry-vtt-types)
- npm `fvtt-types` / `@league-of-foundry-developers/foundry-vtt-types`:
  - dist-tags: `latest` = `13.346.0-beta.20250812191140` (2025-08-12), `beta` = `14.366.0-beta.20260922013222` (2026-09-22).
  - The last 13.x publish was `13.346.0-beta.20251209192131` (2025-12-09). The first 14.x publish was 2026-08-15.
  - MIT license. npm maintainers: akrigline, cswendrowski, johannes.loher, kmoschcau, lordzeel, lukeabby, leagueoffoundryvttdevelopers.
  - Peer dependency: typescript ^5.4 or @typescript/native-preview.
  - — [npm registry: fvtt-types](https://registry.npmjs.org/fvtt-types), [npm: @league-of-foundry-developers/foundry-vtt-types](https://www.npmjs.com/package/@league-of-foundry-developers/foundry-vtt-types)
- odd-rpg's package.json declares `"fvtt-types": "github:League-of-Foundry-Developers/foundry-vtt-types#main"`. package-lock resolves it to version `13.346.0`. — local file `/home/user/odd-rpg/package.json`, `/home/user/odd-rpg/package-lock.json`

### Inferences
- For a v13-only system, fvtt-types `main` is now the wrong target. odd-rpg must either pin a pre-August-2026 commit or npm beta build (e.g. `13.346.0-beta.20251209192131`), or switch to one of the alternatives below. This affects the whole comparison: after the v14 move, the only v13-specific type sets still being updated are the pf2e-derived ones.

### Gaps
- The exact commit where `main` switched from 13 to 14 was not identified. There was no npm publish between 2025-12-09 and 2026-08-15, so the v13 state of main during that window is only reachable by git commit.

---

## 1. Does Foundry Gaming LLC ship or plan official TypeScript declarations?

### Takeaway
No official `.d.ts` files were found. Core is JavaScript documented with JSDoc, and since v13 it uses TypeScript-5.5-style `@import` JSDoc syntax. Foundry publishes TypeDoc-style API docs, not a types package. The only official npm package is the CLI. No official statement promising TypeScript declarations was found. The foundryvtt.com pages were blocked, so this could not be checked exhaustively.

### Cited Findings
- fvtt-types describes itself as "Unofficial type declarations for the Foundry Virtual Tabletop API". — [GitHub](https://github.com/League-of-Foundry-Developers/foundry-vtt-types)
- The only `@foundryvtt/*` package found on npm is `@foundryvtt/foundryvtt-cli` ("The Official CLI for Foundry VTT", v3.0.4, 2026-07-01). There is no official types package. — [npm search](https://registry.npmjs.org/-/v1/search?text=foundry-vtt+types)
- Release 0.8.0 notes (search snippet): the server-side code was "overhauled to standardize the use of ESModules and remove usage of TypeScript". — [Release 0.8.0](https://foundryvtt.com/releases/8.88) (snippet only; page blocked)
- Release 13.332 notes (search snippet): core "refactored syntax used for type imports in JSDoc" to TypeScript 5.5 style. — [Release 13.332](https://foundryvtt.com/releases/13.332) (snippet only)
- Foundry's API docs ("Foundry Virtual Tabletop - API Documentation - Version 14") include a `foundry.types` module page. — [API docs](https://foundryvtt.com/api/), [foundry.types](https://foundryvtt.com/api/modules/foundry.types.html) (seen in search results; not fetched)
- Evidence that core JSDoc is rich enough to compile: `@anandamideio/foundry-types` ships `.d.mts` files whose content is clearly `tsc --declaration` output from core. They keep the JSDoc blocks, with `@import {ActorData} from "./_types.mjs"` and `export default class BaseActor extends Document<ActorData, ...>`. — [npm tarball of @anandamideio/foundry-types 13.350.4](https://registry.npmjs.org/@anandamideio/foundry-types)

### Inferences
- Foundry appears to make core "TypeScript-checkable" by writing JSDoc for tsc (the 13.332 change), not by shipping declarations. That is why generating types from core with tsc is possible at all (see section 4).

### Gaps
- I could not find any direct quote from Atropos or another Foundry developer (Discord, dev blog, v13/v14 release notes) about official TypeScript declarations. foundryvtt.com and foundryvtt.wiki were blocked, and searches returned only community sources. Treat "no official plans" as unverified.
- v14 stable release date: a search hit titled "Foundry VTT v14 Released" is dated 2026-04-01 ([foundryvtt.store](https://www.foundryvtt.store/news/2026-04-01-foundry-vtt-v14), blocked; third-party site). dnd5e 6.0.5 and Draw Steel both require minimum `14.367`, which shows v14 is stable and current as of Sept 2026 ([dnd5e system.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/HEAD/system.json)).

---

## 2. System-embedded / pf2e-derived type sets

### Takeaway
pf2e hand-maintains a complete Foundry type tree in `types/foundry/` under Apache-2.0. It is not published by pf2e, but there is a separate branch per Foundry version, including `v13-dev`. At least two npm packages republish it: `@dfreds/foundry-types` (v14 only, Aug 2026) and `@7h3laughingman/foundry-types` (v13 line to 13.351.20, then v14). This is the most realistic alternative to fvtt-types.

### Cited Findings

#### pf2e `types/foundry` (source of truth)
- pf2e package.json: `"name": "foundry-pf2e"`, `"private": true`, `"license": "Apache-2.0"`. It is not published to npm. — [pf2e package.json](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/package.json)
- LICENSE is Apache License 2.0. — [pf2e LICENSE](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/LICENSE)
- How the types are wired: tsconfig `paths` map `@common/*` to `./types/foundry/common/*` and `@client/*` to `./types/foundry/client/*`, and include `./types/foundry/global-external.d.mts`. It uses `strict: true` and `skipLibCheck: true`. — [pf2e tsconfig.json](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/tsconfig.json)
- Branches include `v13-dev`, `v14-dev`, `master`, `release`. On `v13-dev`, system.json has version 7.9.1 and compatibility `{minimum: 13.348, verified: 13.351, maximum: 13}`. — [pf2e v13-dev system.json](https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/static/system.json), `git ls-remote https://github.com/foundryvtt/pf2e`
- Example file `types/foundry/client/documents/actor.d.mts` exists: hand-written generic declarations, e.g. `BaseActor<TParent>`, `ClientDocument<TParent>`, typed DB operation option types. — [pf2e actor.d.mts](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/types/foundry/client/documents/actor.d.mts)
- Caveat: these types are shaped around pf2e's own needs. The DFreds changelog records many missing members that it patched, e.g. `ActiveEffect#system` untyped, `TileDocument` missing `name`/`elevation`, `CONFIG.Canvas` missing `darknessAnimations`. — [DFreds CHANGELOG](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/CHANGELOG.md)

#### `@dfreds/foundry-types` (npm)
- Latest `14.366.1`, published 2026-08-17. First publish 2026-08-04, 5 versions. Apache-2.0. Maintainer: dfreds08. Repo [DFreds/dfreds-foundry-types](https://github.com/DFreds/dfreds-foundry-types). Peer dependency typescript >=5.9. About 2.3 MB, 647 files. — [npm registry](https://registry.npmjs.org/@dfreds/foundry-types)
- README: "The definitions come from the pf2e system … which maintains them by hand. This package copies them, versions them against Foundry, and publishes them. It adds no types of its own." Version = Foundry build (14.365.0 = v14 build 365). Setup uses the same `@common/*` / `@client/*` path aliases plus `/// <reference types="@dfreds/foundry-types" />` for globals. — [README](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/README.md)
- Sync process: pulls pf2e's `v14-dev` branch, applies local `patches`, runs `npm run check` with `skipLibCheck` off, and publishes from GitHub Actions with npm trusted publishing. It ships a `NOTICE` file for Apache attribution. — [README](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/README.md), [package.json](https://raw.githubusercontent.com/DFreds/dfreds-foundry-types/HEAD/package.json)
- DFreds also documents a TS module template. — [DFreds Module Template TS](https://www.dfreds-modules.com/developers/module-template-ts/) (search result; not fetched)
- **No v13 build**: all versions are 14.365.x–14.366.x.

#### `@7h3laughingman/foundry-types` (npm)
- Versions 13.351.0 → 13.351.20 were published 2026-02-15 → 2026-03-20. Versions 14.360.0 → 14.363.0 followed, 2026-04-11 → 2026-06-04 (latest). 30 versions in total. MIT. Maintainer: 7h3laughingman. Repo [7H3LaughingMan/foundry-types](https://github.com/7H3LaughingMan/foundry-types) with branches `v13` (package.json 13.351.20) and `v14` (14.363.0). About 2.2 MB, 643 files. — [npm registry](https://registry.npmjs.org/@7h3laughingman/foundry-types), [v13 package.json](https://raw.githubusercontent.com/7H3LaughingMan/foundry-types/v13/package.json)
- Package description: "Basic TypeScript types for FoundryVTT". The README is badges only. Exports `.`, `./client/*`, `./common/*`, `./global-external`. — [npm](https://www.npmjs.com/package/@7h3laughingman/foundry-types)
- Its `src/client/documents/actor.d.mts` matches pf2e's file line for line, except the import alias is `#client`/`#common` instead of `@client`/`@common`. The published package does not mention pf2e anywhere (grep found no match). It carries an MIT LICENSE "Copyright (c) 2026 7H3LaughingMan". — tarball of [14.363.0](https://registry.npmjs.org/@7h3laughingman/foundry-types/-/foundry-types-14.363.0.tgz) compared with [pf2e actor.d.mts](https://raw.githubusercontent.com/foundryvtt/pf2e/HEAD/types/foundry/client/documents/actor.d.mts)
- GitHub page: 0 stars, 3 forks, about 99 commits on v14. — [GitHub](https://github.com/7H3LaughingMan/foundry-types)

#### Other systems
- **Draw Steel** (MetaMorphic-Digital) uses JS + JSDoc against the real core source, not vendored `.d.ts`. See section 3. — [draw-steel jsconfig.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/jsconfig.json)
- **dnd5e** vendors no types. See section 3.
- **INVESTIGATOR** published `@lumphammer/investigator-fvtt-types` (1.14.0-alpha.2, 2024-07-03). The repo `n3dst4/investigator-fvtt-types` is archived. These are types *of that system* for add-on authors, not Foundry core types. — [npm search](https://registry.npmjs.org/-/v1/search?text=fvtt+types), [GitHub](https://github.com/n3dst4/investigator-fvtt-types)
- The League also has `foundry-vtt-dnd5e-types` (system types, not core). — [GitHub](https://github.com/League-of-Foundry-Developers/foundry-vtt-dnd5e-types) (search result only)

### Inferences
- **Best fit for odd-rpg on v13**:
  - Option A: vendor pf2e's `types/foundry` from the `v13-dev` branch (Apache-2.0; keep LICENSE/NOTICE). This is exactly what pf2e itself uses on v13.351.
  - Option B: depend on `@7h3laughingman/foundry-types@13.351.20`. This is frozen since 2026-03-20; it is a single-maintainer package with no v13 activity since.
  - `@dfreds/foundry-types` is only an option after moving to v14.
- Style trade-off vs fvtt-types:
  - pf2e types use a different design: explicit generics such as `Actor<TParent>`, and systems usually subclass and redeclare `system` types by hand.
  - fvtt-types uses declaration-merging config interfaces (`DataModelConfig`, `DocumentClassConfig`, etc.) with schema-inferred `system` data.
  - Migrating means rewriting how odd-rpg types its DataModels and documents. pf2e types have much less automatic inference from `defineSchema()`.
- pf2e's tsconfig uses `skipLibCheck: true`, so its types may not be internally strict-clean. DFreds' "check with skipLibCheck off" step and patch list suggest they needed fixes.
- Licensing risk with `@7h3laughingman/foundry-types`: it relicenses Apache-2.0 content as MIT without attribution. This is a maintainer issue, but a cautious project might prefer vendoring from pf2e directly or using DFreds (which ships a NOTICE).

### Gaps
- There is no independent measure of coverage or completeness, such as the share of the v13 API declared in pf2e types vs fvtt-types. Coverage is known to follow pf2e's needs.
- The last commit date of pf2e `v13-dev` was not retrieved (the atom feed failed). Its system.json verifies 13.351.
- Lancer (`lancer-system/foundryvtt-lancer`), SWADE (GitLab `peginc/swade`) and sf2e: raw package.json/tsconfig fetches returned nothing (wrong path or default branch), so whether they vendor types is **unverified**. SF2e is known to share pf2e's codebase lineage, but this was not verified here.

---

## 3. JSDoc-only approach (JS + JSDoc, optionally `checkJs`, against core source)

### Takeaway
Major systems written in JS (dnd5e, Draw Steel) type against **Foundry's own source**, not a types package. They point a jsconfig `paths` alias at a local, gitignored `foundry/` copy or symlink of the Foundry install. dnd5e does not even run tsc/checkJs; it lints JSDoc with ESLint. Without a type-checker in CI this gives IntelliSense but no enforced type safety. That is a step down for a strict-TS project.

### Cited Findings
- dnd5e (6.0.5, requires Foundry `minimum: 14.367`, author Atropos):
  - No `jsconfig.json` or `tsconfig.json` at the repo root (both 404).
  - devDependencies include `eslint-plugin-jsdoc` and `@foundryvtt/foundryvtt-cli`, and no TypeScript or types package.
  - It builds with rollup from `dnd5e.mjs`.
  - — [dnd5e package.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/HEAD/package.json), [dnd5e system.json](https://raw.githubusercontent.com/foundryvtt/dnd5e/HEAD/system.json)
- Draw Steel (Foundry `minimum 14.367`, `maximum 14`):
  - jsconfig `paths` map `@client/*` to `./foundry/client/*` and `@common/*` to `./foundry/common/*`.
  - It includes `foundry/client/client.mjs` and a hand-written `draw-steel.d.ts`, plus `typeAcquisition` for jquery.
  - `.gitignore` lists `foundry`, i.e. the Foundry install is linked locally and not committed.
  - package.json has `typescript` and `typescript-eslint` as devDeps.
  - — [jsconfig.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/jsconfig.json), [.gitignore](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/.gitignore), [package.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/package.json), [system.json](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/system.json)
- Core JSDoc uses TS-5.5 `@import` type syntax since 13.332 ([release 13.332 snippet](https://foundryvtt.com/releases/13.332)), so tsc can resolve those imports.

### Inferences
- Pros:
  - Types always exactly match the installed Foundry build.
  - No third-party lag, no package, no license redistribution issue (the core code is never redistributed).
  - This is what the core team's own systems do.
- Cons:
  - Every developer and CI job needs a licensed Foundry install. That is a blocker for public CI unless the source is cached privately.
  - Core JSDoc is looser than hand-written types: schemas are not inferred into `system` types, and many `object`/`any` types remain (see the tsc output in section 4).
  - Converting odd-rpg from strict TS to JS+JSDoc would be a large regression in type strictness.
- A hybrid is possible: keep `.ts` sources, but set `allowJs` + `paths` to the local Foundry install. tsc then type-checks against core JS directly. This is unverified for performance and error volume, and core would need `skipLibCheck`-style isolation.

### Gaps
- Whether Draw Steel runs `tsc --noEmit` / checkJs in CI (vs editor-only IntelliSense) was not verified; no workflow file was inspected.
- The dnd5e contributor docs on IDE setup were not read.

---

## 4. Other options: generated-from-core types, DefinitelyTyped, forks, frameworks, hand-written ambient declarations

### Takeaway
There is no DefinitelyTyped entry. Several small projects auto-generate `.d.ts` from a local Foundry install with tsc: `686d7066/fvtt-types` (GitHub-only, v14) and `@anandamideio/foundry-types` (v13.350, one-day publish, Oct 2025). They are shallow but always build-exact. `@illandril/foundryvtt-types` is a small hand-written subset. VTTForge (`@vttforge/types`) is a v14+ framework with its own partial surface. For a v13 strict-TS system, none beats fvtt-types-pinned-to-v13 or pf2e-v13 types.

### Cited Findings

#### DefinitelyTyped
- `@types/foundry-vtt`, `@types/foundryvtt` and `@types/foundry` do not exist on npm (registry "Not found"). — [npm registry](https://registry.npmjs.org/@types/foundry-vtt)

#### Generated from a local Foundry install (`tsc --declaration` style)
- **`686d7066/fvtt-types`** (GitHub only, not on npm under this name):
  - README: "Unofficial TypeScript declarations for Foundry Virtual Tabletop module development. This package is generated from a local Foundry VTT installation".
  - To build it yourself, set `foundryApp` to `resources/app` and run `npm run build`. Install with `npm install --save-dev github:686d7066/fvtt-types#<tag>`; the README example tag is `14.370.1`.
  - package.json: `name: fvtt-types`, `version: 14.363.0`, license "SEE LICENSE IN LICENSE.md" (LICENSE.md fetch returned 404), scripts `generate: tsx scripts/generate-types.ts`, TypeScript 5.6.3.
  - Repo created 2026-05-27, last updated 2026-05-30, 0 stars.
  - — [README](https://raw.githubusercontent.com/686d7066/fvtt-types/HEAD/README.md), [package.json](https://raw.githubusercontent.com/686d7066/fvtt-types/HEAD/package.json), [GitHub](https://github.com/686d7066/fvtt-types)
  - Note: its package name `fvtt-types` collides with the League's npm name.
- **`@anandamideio/foundry-types`**:
  - `13.350.4`, all 5 versions published 2025-10-28. Maintainer: abaccus. License "SEE LICENSE IN license.html", but no license.html is in the tarball. No repository listed. About 2.7 MB, 654 `.d.mts` files under `_dts/client` and `_dts/common`, and a README saying "types are for Foundry VTT v13.350".
  - Its contents are tsc output from core JSDoc. Quality is visibly shallow: `static metadata: object;`, and schema fields are un-parameterized (`name: fields.StringField;`).
  - — [npm registry](https://registry.npmjs.org/@anandamideio/foundry-types); tarball inspected
  - Same author's earlier `@anandamideio/fvtt-types` 0.1.1 ("Type definitions for FVTT V12", 2024-07-28, 8 files) is negligible. — [npm registry](https://registry.npmjs.org/@anandamideio/fvtt-types)
- **`foundryvtt-types`** (mbround18):
  - 0.0.5, 2022-12-16, "Compiled types from FoundryVTT, working on a way to automate it". ISC, 3 files. **Abandoned / outdated** (Foundry v10 era). — [npm registry](https://registry.npmjs.org/foundryvtt-types)
- Earlier experiments:
  - `ElfFriend-DnD/foundryvtt-autogen-types` ("documenting some experiments regarding typescript and foundry", last updated 2020-12-15). — [GitHub](https://github.com/ElfFriend-DnD/foundryvtt-autogen-types)
  - `ShoyuVanilla/foundryvtt-typescript-types` (2020). — [GitHub](https://github.com/ShoyuVanilla/foundryvtt-typescript-types)
  - Both are **outdated**.

#### Hand-written subsets
- **`@illandril/foundryvtt-types`**:
  - 9.1.0, 2025-07-21, MIT, maintainer joespan. About 145 KB, 238 files.
  - README: "A subset of FoundryVTT typescript definitions used by … illandril in his FoundryVTT modules."
  - No v14 activity; the Foundry version targeted is not stated in the README.
  - — [npm registry](https://registry.npmjs.org/@illandril/foundryvtt-types), [README](https://raw.githubusercontent.com/illandril/FoundryVTT-types/HEAD/README.md)

#### Framework-bundled types
- **VTTForge**:
  - `@vttforge/types` 0.11.1 (2026-09-14, MIT, 17 versions since 2026-05-05, maintainer fabriciosx). About 108 KB, 7 files. Description: "The TypeScript surface shared across VTTForge packages: the Foundry members the sheet and application bases stand on."
  - `@vttforge/cli` 0.18.8.
  - README: "An SDK and CLI for building Foundry VTT v14+ systems and modules". Status: 0.x, and "a minor bump is a breaking change". Offers `InferSchema` to derive `system` types from `defineSchema()`.
  - A search snippet says `@vttforge/types` covers documents, game, ui, CONFIG, CONST, foundry.utils, dice, chat, combat, scenes, tokens, canvas, ApplicationV2 and a typed hook map.
  - — [npm registry](https://registry.npmjs.org/@vttforge/types), [README](https://raw.githubusercontent.com/vttforge/vttforge/HEAD/README.md), [GitHub](https://github.com/vttforge/vttforge)
  - **v14+ only**, so not usable for odd-rpg on v13. It is also tied to adopting the VTTForge framework.
- `@revolutionarygamesco/common-foundryvtt` 0.6.0 (2026-08-22, GPL-3.0-or-later): a helper library with some types. Not a core type set. GPL would be a licensing consideration. — [npm registry](https://registry.npmjs.org/@revolutionarygamesco/common-foundryvtt)

#### Forks of fvtt-types
- `BM123499/foundry-vtt-types` is a fork of the League repo (same README title). No independent npm package was found. — [GitHub](https://github.com/BM123499/foundry-vtt-types)

#### Minimal hand-written ambient declarations
- Draw Steel ships a hand-written `draw-steel.d.ts` alongside core-source typing ([jsconfig include](https://raw.githubusercontent.com/MetaMorphic-Digital/draw-steel/HEAD/jsconfig.json)). This is the pattern for a small surface.
- The henry-malinowski repos (`libwrapper-types`, `health-estimate-types`) show module-API-only type packages. — [GitHub](https://github.com/henry-malinowski/libwrapper-types)

### Inferences
- Summary comparison for odd-rpg (strict TS, v13):

| Option | Foundry versions | Latest / date | Source of types | Fit for odd-rpg v13 |
|---|---|---|---|---|
| fvtt-types pinned to a v13 commit / `13.346.0-beta.20251209192131` | 13 (beta) | 2025-12-09 (v13 line frozen) | hand-written, schema inference | Best continuity; no further v13 fixes |
| pf2e `types/foundry` @ `v13-dev` (vendored) | 13.348–13.351 | pf2e 7.9.1 | hand-written by pf2e | Strong, Apache-2.0; different typing idiom |
| `@7h3laughingman/foundry-types@13.351.20` | 13.351 | 2026-03-20 | pf2e copy | OK, frozen, single maintainer, attribution issue |
| `@dfreds/foundry-types` | 14.365–14.366 | 2026-08-17 | pf2e copy + patches | Only after v14 upgrade |
| JSDoc/allowJs against local install | exact build | n/a | core JSDoc | Weak strictness; needs Foundry in CI |
| `@anandamideio/foundry-types` | 13.350 | 2025-10-28 | tsc-generated | Shallow, unclear license, abandoned |
| `686d7066/fvtt-types` | 14.x (generator works for any) | 2026-05-30 | tsc-generated | Generator could be run on a v13 install; shallow |
| `@vttforge/types` | 14+ | 2026-09-14 | framework subset | No (v14, framework lock-in) |
| `@illandril/foundryvtt-types` | unstated | 2025-07-21 | hand subset | No (tiny subset) |
| Hand-written ambient `.d.ts` | any | n/a | self | Only for tiny API surface |

- Redistributing tsc-generated core declarations (anandamideio, 686d7066) may conflict with Foundry's proprietary license, since the `.d.mts` files embed core JSDoc text. The 686d7066 README instead has users generate the types locally. I did not verify the actual Foundry EULA text (site blocked).

### Gaps
- There is no comparative quality benchmark: no count of `any`, and no test of how each set handles `TypeDataModel` schema inference under `strict`.
- I found no AI/LLM-generated Foundry typings package that presents itself as such. `familiar-vtt` and `foundryvtt-mcp` on npm are MCP/AI tools for running Foundry, not type sets ([npm search](https://registry.npmjs.org/-/v1/search?text=foundry-vtt+types)).
- Reddit and Discord discussions comparing these options were not found via search; the League Discord is not publicly indexable.
