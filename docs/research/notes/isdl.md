# ISDL (Intelligent System Design Language): a code-generating meta-framework for Foundry VTT systems — as of 2026-09-26

Method note: this pass followed up on **recent Reddit discussion** of a VTTForge-like meta-framework, but **Reddit itself could not be read from this environment**. The search API rejects `reddit.com` as a domain filter, the fetch tool refuses the domain, and direct `curl` returns HTTP 403 (datacenter IP). Every mirror tried either failed to connect, rate-limited, or served a bot challenge (Anubis on redlib.tiekoetter.com, "gandalf" on reddit.nerdvpn.de). Brave's index, queried via `curl`, did return Reddit post **titles**, but no bodies or comments. The tool was therefore identified from the package and repository side — npm registry search, the GitHub REST and code search APIs (via authenticated `gh`), the GitLab API, the VS Code Marketplace — and then **confirmed by the user as the one they had seen**. What the Reddit discussion said about it remains unread (see §4 Gaps). Unlike the earlier notes in this directory, **foundryvtt.com was reachable this pass**, so snippet-only claims elsewhere in `docs/research/` can now be checked against the real pages.

## 1. Identity, provenance and maintenance status

### Takeaway
ISDL is a **domain-specific language, with a VS Code extension and a CLI, that generates a complete Foundry VTT system** from a `.isdl` file. Its author, Cody Swendrowski (`cswendrowski`), is also one of the fvtt-types npm maintainers, which gives the project more standing than its numbers suggest. Those numbers are small: **12 GitHub stars, 42 VS Code Marketplace installs, one contributor and 51 open issues**, with the last commit on 2026-08-24. Like VTTForge, its bus factor is 1.

### Cited Findings
- Repo `cswendrowski/intelligent-system-design-language`: created 2024-07-31, last push 2026-08-24, 12 stars, 1 fork, 51 open issues, 2 watchers, TypeScript, topics `foundryvtt` and `programming-language`. The GitHub API reports **`license: null`**: the repository has no LICENSE file. — [repo](https://github.com/cswendrowski/intelligent-system-design-language) (GitHub REST API `repos/cswendrowski/intelligent-system-design-language`)
- Repo description: "a custom programming language that enables you to create professional Virtual Tabletop Systems in hours, not months. It generates modern Foundry VTT systems compatible with Foundry V12 to V14 using cutting-edge web technologies." — same API call
- npm package `intelligent-system-design-language` 0.4.3 (2026-08-24): **license declared as `GPL-3.0`**, sole maintainer `cswendrowski`, keywords `isdl`, `foundry-vtt`, `tabletop-rpg`, `dsl`, `game-system`, `character-sheet`. 22 versions, the first (`0.3.13`) on 2026-05-30. The npm description reads only "Intelligent System Design Language support for Visual Studio Code", so registry searches present it as an editor extension, not a framework. — [npm registry](https://registry.npmjs.org/intelligent-system-design-language)
- The contributors API returns one entry: `cswendrowski`, 369 commits. — GitHub REST API `repos/.../contributors`
- Tagged releases: `0.4.3` (2026-08-24), `0.4.2` (2026-08-10), `0.4.1` (2026-06-14), `0.4.0` (2026-06-08), preceded by a dense run of `0.3.x` tags in late May and early June 2026. — GitHub REST API `repos/.../releases`
- Recent commits touch the language and the code generator, not only docs: `feat(lang): explain quoted dice in a choices: list`, `fix(sheets): quote die/dice choices: so the select renders (#142)`, `fix(codegen): resolve self<...> and choice<Document> refs in roll data`, `docs: how to run Foundry v12/v13/v14 locally`. — GitHub REST API `repos/.../commits`
- VS Code extension, publisher **IronMooseDevelopment**: 42 installs, no ratings, "last updated" 2026-09-23. An Open VSX listing also exists (seen in search results, not fetched). — [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=IronMooseDevelopment.isdl); [Open VSX](https://open-vsx.org/extension/IronMooseDevelopment/isdl)
- `cswendrowski` is in the `fvtt-types` npm maintainer list recorded in [type_alternatives.md](type_alternatives.md), alongside akrigline, johannes.loher, kmoschcau, lordzeel and lukeabby.
- One fork exists: `fcsouza/intelligent-system-design-language`, created and last pushed on 2026-09-10, 0 stars; its commits were not compared with upstream. The same handle authored VTTForge PR #283 ("docs: finish the pnpm-to-bun sweep"), so at least one VTTForge contributor has taken an interest in ISDL. — GitHub REST API `repos/fcsouza/intelligent-system-design-language`; [vttforge PR #283](https://github.com/vttforge/vttforge/pull/283) (search snippet, not fetched in full)

### Inferences
- The npm description undersells the project. A search for Foundry *frameworks* does not surface ISDL; this pass found it only through a `keywords:foundry-vtt` sweep. That likely explains why [frameworks.md](frameworks.md) §4 missed it.
- A GPL-3.0 declaration on npm with no LICENSE file in the repo is a real ambiguity for anyone releasing a system built with the tool, not a clerical detail.
- Only two releases (0.4.2, 0.4.3) have shipped since mid-June 2026. Given the August codegen fixes, this looks like a project past its initial burst rather than an abandoned one.

### Gaps
- The Marketplace "last updated" date (2026-09-23) is a month later than the last repository push (2026-08-24). The extension may be built from an unpushed branch, or the date may reflect a metadata-only republish; neither was confirmed.
- The Open VSX install count was not read, so 42 counts Marketplace installs only.
- No public roadmap, governance or contribution policy was found.

## 2. What it generates: Foundry compatibility and tech stack

### Takeaway
**ISDL targets v14, even though its documentation says it does not.** The generator writes `compatibility: { minimum: 12, verified: 14 }` into each system manifest, which was verified in source. The README and the docs site still say "V12 and V13" and never mention v14, so the docs are out of date, not the tool. Generated sheets use **Vue 3 + Vuetify**, a different UI model from odd-rpg's ApplicationV2 + Handlebars PARTS.

### Cited Findings
- The system.json generator emits, verbatim:
  ```
  "compatibility": {
      "minimum": 12,
      "verified": 14
  }
  ```
  — `isdl/src/cli/generator.ts` lines 161-164, read via GitHub REST API `repos/.../contents`
- The README and the documentation site both say ISDL "generates modern Foundry VTT systems compatible with Foundry V12 and V13", with no mention of v14. — [README](https://github.com/cswendrowski/intelligent-system-design-language); [docs site](https://cswendrowski.github.io/intelligent-system-design-language/)
- v14 work is tracked in the repo, e.g. `isdl/docs/superpowers/specs/2026-04-26-foundry-v14-measured-templates-design.md`, and the most recent commit documents running Foundry v12, v13 and **v14** locally. — GitHub code search over the repo
- Generated UI, per the README: **Vue 3 + Vuetify** reactive sheets; DataTables with search, filter, sort and drag-drop; an **Edit vs Play mode** toggle; a responsive layout for desktop and tablet. — [README](https://github.com/cswendrowski/intelligent-system-design-language)
- Other features the README claims: Active Effects through Foundry's visual editor, with "smart targeting" and field validation; dice arithmetic where a d4 multiplied by 2 becomes a d8; roll breakdowns with labelled components; conditional field visibility (e.g. Ki trackers only for Monks); resources wired to token bars, with damage application. — same README
- Surrounding tooling: the VS Code extension (syntax highlighting, validation, autocomplete, an `ISDL - Generate` command), a CLI for build automation and CI/CD, GitHub sign-in for publishing releases, gist sharing, and semantic-version detection based on `.isdl` changes. — same README
- Stated position: the no-code builders (**Simple World Building, Custom System Builder, Sandbox**) sit below it. ISDL "is not nearly as complicated as developing a full Foundry system from scratch, but it is still a programming language", and assumes "basic familiarity with scripting languages as Javascript". — same README, "Design Philosophy"

### Inferences
- Supporting v12 through v14 from one generator is a wide span. Those three generations differ on Active Effects, ApplicationV2 rendering and manifest fields, and the codegen has to handle all of them, which likely contributes to the 51 open issues.
- Vue 3 + Vuetify is a reasonable choice for generated output, since ISDL users never edit the sheet code directly. It does mean a generated system shares no UI conventions with a hand-written ApplicationV2/Handlebars one.

### Gaps
- Only the **manifest value** was checked for v14. No generated system was built and loaded in 14.368, so runtime correctness on v14 is unverified.
- The `isdl/examples/` directory (including `noir.isdl`) was not reviewed, so how much the language can express is unassessed.
- Whether any system on Foundry's package registry was built with ISDL was not checked.

## 3. Fit for odd-rpg

### Takeaway
**ISDL fits odd-rpg worse than VTTForge, which was already declined.** The difference is one of kind, not quality. VTTForge is a library that odd-rpg would call, so adopting it is incremental and reversible. ISDL is a generator that **owns its entire output**, so adopting it means deleting the hand-written codebase and re-expressing ODD's rules in someone else's language. It also does nothing for the type-escape problem: it deletes the code that contains the escapes instead of typing it.

### Cited Findings
- ISDL would replace odd-rpg's current architecture wholesale: the TypeDataModel models in `src/module/data/`, the `HandlebarsApplicationMixin(ActorSheetV2)` sheets with `static PARTS`/`TABS`, the custom `OddActor`/`OddItem` documents, the floating initiative tracker (`src/module/tracker/initiative-tracker.ts`) and the `[[/oddPool]]`/`[[/oddPenalty]]` enrichers (`src/module/enrichers.ts`). — local repo; commits `1195936`, `a818e42`
- The type escapes sit mostly in that code: 59 lines in `src/module/sheets/actor.ts`, 28 in `src/module/sheets/item.ts` and 20 in the initiative tracker. — local `grep` over `src/`, 2026-09-26

### Inferences
- Moving to ISDL would be a rewrite, not a port, and some work would be lost outright. The Handlebars PARTS structure that odd-rpg's v13 ApplicationV2 migration produced has no equivalent in Vue 3 + Vuetify output.
- The one way out is that generated output is an ordinary Foundry system, so odd-rpg could generate once and maintain the result by hand. That is a one-way migration that discards the generator's value. It could make sense for producing a reference implementation, but not as a way to adopt ISDL.
- Licensing matters more for a generator than for a library. If a GPL-3.0 tool with no LICENSE file produces the whole of a system that odd-rpg then releases under its own terms, the licensing question has to be answered before adoption, not after.
- This reinforces the conclusion of [foundry-vtt-typescript-tooling.md](../foundry-vtt-typescript-tooling.md): the leverage is in pinning fvtt-types and running `tsc`, and no framework in this space, whether library or generator, replaces that.
- ISDL is the right tool for a different project: a new system, started from scratch by someone who wants sheets and Active Effects handled for them. odd-rpg, at v0.8.0 with a working hand-written codebase, is past that point.

### Gaps
- Whether ISDL's GPL-3.0 license extends to the systems it generates was **not** determined. This is the deciding question if adoption is ever reconsidered, and the repository cannot answer it in its current state (no LICENSE file).
- The cost of re-expressing ODD's rules (keep-highest initiative, strain, hit-location wounds, encumbrance) in the DSL was not estimated, because the language reference was not read in depth.

## 4. Field survey: what else exists

### Takeaway
A sweep of npm, GitHub (topics, free text, code search) and GitLab found **no third meta-framework**. Among repositories created in 2026 under the `foundryvtt` and `foundry-vtt` topics, **VTTForge (11 stars) is the only new developer framework**; everything ranked above it is a gameplay module. Within the limits of this sweep, ISDL and VTTForge are the whole field: ISDL as the generator, VTTForge as the SDK.

### Cited Findings
- 2026-created repos under both topics, by stars: Geano's module cluster (`geanos-scene-rotation` 65, `geanos-scene-optimizer` 60, `geanos-phantom-performance` 26, `geanos-soundscape-realism` 19, `geanos-jump-n-run-editor` 18, `geanos-gdsa-qol` 17), then `vttforge/vttforge` (11). No other developer framework appears in the top 30 of either listing. — GitHub REST API `search/repositories?q=topic:foundryvtt+created:>2026-01-01`, and the same for `foundry-vtt`
- **Ruled out: `tanis90/arcanedesk`** (Apache-2.0, created 2026-08-30, last push 2026-09-24, 0 stars, topics include `sdk` and `foundry-vtt`). It calls itself "SDK-first ... including the Foundry SDK, CLI, and Electron desktop app", but it is an **MCP / WebMCP agent-automation toolkit** for driving a licensed Foundry install from Codex. It offers nothing for system authors. — [repo](https://github.com/tanis90/arcanedesk) and its README
- GitLab: `kitefrost/foundry-vtt-sdk` (public, created 2026-08-01, last activity 2026-09-22, 0 stars; description "KiteFrost foundry-vtt SDK") appears to be one vendor's SDK for its own module, judging by its sibling repo, a module testing channel. `fvtt-grubes/fvtt-template-system` (created 2026-02-10, last activity 2026-02-11, 0 stars) is a dormant system template. — GitLab API `projects?search=...`
- The npm `keywords:foundry-vtt`, `keywords:fvtt` and `keywords:ttrpg` sweeps, limited to 2026 publishes, found only narrow tooling: `create-fvtt-module` 0.7.0 (2026-09-14), `@zuedev/create-foundry-module` 0.1.0 (2026-09-12), `@phillip-best/foundry-build-tools` 0.2.0 and `foundry-migration-tools` 0.1.0 (2026-08-12/13), `vite-plugin-fvtt` 0.2.12 (2026-07-06), `@thefehr/foundry-playwright` 1.4.4 (2026-09-21) and `@heroiclands/package-build` 22.12.3 (2026-09-26). None is a system framework. — [npm search API](https://registry.npmjs.org/-/v1/search?text=keywords:foundry-vtt&size=40)
- Foundry's "Frameworks and Libraries" page lists only the libraries core bundles (**Handlebars, jQuery, PixiJS, GreenSock**) and no community frameworks, so it is no help in finding tools like these. — [foundryvtt.com/article/frameworks](https://foundryvtt.com/article/frameworks/)

### Inferences
- The 2026 field is two projects with opposite approaches: **VTTForge** (write TypeScript against an SDK; v14+ only) and **ISDL** (write a DSL and generate everything; v12-v14). Both are pre-1.0 with a bus factor of 1, and neither changes the recommendation in the synthesis doc.
- The no-code tier that ISDL names (Simple World Building, Custom System Builder, Sandbox) is still unresearched, as [frameworks.md](frameworks.md) §6 already notes. ISDL's README now gives a citable source for where those three sit relative to it.
- This note fills the gap in [frameworks.md](frameworks.md) §4, which covered scaffolds, templates and build plugins but found no DSL-based generator.

### Gaps
- **The Reddit discussion that prompted this note was never read.** User reports, criticism, comparisons with VTTForge and any statements from the maintainer there are all unverified. If Reddit becomes reachable, that thread is the most valuable remaining source.
- GitHub topic searches only find repos that set a topic, so a framework without one would not appear in the 2026 sweep.
- Codeberg, where some Foundry developers host, was not swept (it was reached only indirectly, via `vite-plugin-foundryvtt`).
