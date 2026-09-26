# ODDEasy support: plan — as of 2026-09-26

Add ODDEasy, the rules-lite version of ODD, to the odd-rpg system: a second character type whose sheet follows the ODDEasy rules and reuses ODD's shared engine. The source is *The ODDeasy v2* (34 pp., © Odysseas Dallas 2026). Its introduction says it keeps "exactly the same core rules" and leaves out the crunchier mechanics.

## Decisions

| # | Decision | Rejected alternatives |
|---|---|---|
| 1 | **One system with both character types** (`character` and `easyCharacter`), plus a world setting that picks the active ruleset | Two Foundry packages built from one repo (suffix overrides); an `odd-core` library shared by two systems |
| 2 | **OOP: abstract base classes, concrete ODD/Easy subclasses, interfaces for the engine**, modelled on dnd5e's `SystemDataModel` hierarchy | Runtime `if (easy)` branches; one type with fields hidden per ruleset |
| 3 | **Separate item types** for Easy talents and flaws (`easyTalent`, `easyFlaw`), sharing abstract bases with `talent` and `flaw` | Die fields added to the ODD types |
| 4 | **Injuries are items** (`injury`) | An array field on the actor |
| 5 | **Move to Foundry v14** before any ODDEasy work | Staying on v13 |
| 6 | **VTTForge for version changes**: the CLI's `migrate` and `audit` for Foundry major upgrades, plus `createMigrationRunner` from `@vttforge/core` for world data migrations. No VTTForge data model or sheet bases | Adopting its whole runtime (`registerSystem`, `BaseTypeDataModel`, sheet bases); not using it at all |
| 7 | **No ODD → ODDEasy conversion for now.** It is feasible later as a one-way copy (see *Deferred*) | Live ODD/Easy toggle on one actor. Rejected because edits can't be written back to the ODD fields: 4 attributes can't turn back into 8 |

## ODDEasy rules that affect the model

| Area | ODDEasy | vs. ODD model |
|---|---|---|
| Attributes | Might, Finesse, Wits, Spirit (d4–d12) | 8 attributes → new `EASY_ATTRIBUTES` config |
| Skills | Combat, Knowledge, Mental, Physical, Social (none or d4–d12) | The same names as ODD's skill *categories*, but a flat list |
| Talents | Short label + die (creation: d10/d8/d6), added to the pool when it applies | ODD talents are tree nodes with no die → `easyTalent` |
| Flaws | Label + die (d4–d12). Penalty when it applies; roll the die afterwards for XP | ODD flaws have a severity → `easyFlaw` |
| Strain | 7 slots, F/E/B (B = armor bulk). Penalty d4 at the 3rd slot up to d12 at the 7th. Incapacitated when full | The penalty track is the same as `STRAIN_FATIGUE_PENALTIES`. No fortitude slots and no bleeding |
| Injuries | Named Wounds (d10 penalty when they apply, max 2; a 3rd becomes Crippled) and named Crippled injuries (auto-fail; constantly Incapacitated) | ODD uses hit locations → `injury` item |
| Common rolls | Awareness = Wits + Mental; Shock = Might + Spirit + Physical | New `EASY_COMMON_ROLLS` |
| Dice pool | Attribute + Skill + Talents + Bonuses. Up to 5 dice, keep the best 5; 1s are Hitches | Same core rules; stays in the shared engine |
| Initiative | None: the GM picks which side goes first | The Easy sheet has no initiative section |
| XP / advancement | XP and costs per die step; **Odds** (a d100 table at the end of an adventure) | XP field shared; Odds deferred |

## Architecture

```
DATA MODELS (src/module/data/)
foundry.abstract.TypeDataModel
└─ OddDataModel (abstract)                  schema merge helper (cf. dnd5e SystemDataModel.mergeSchema)
   ├─ OddCharacterDataBase (abstract)       playerName, xp, attributes, skills, strain, biography,
   │  │                                     savedRolls, rollModifiers; implements RollingActor
   │  ├─ CharacterData        "character"      + statistics, wounds, fortitude, encumbrance, customSkills
   │  └─ EasyCharacterData    "easyCharacter"  (attributes/skills from EASY_* config)
   └─ OddItemDataBase (abstract)            description (replaces the unused BaseItemDataModel)
      ├─ TalentDataBase (abstract)
      │  ├─ TalentData        "talent"         tree, rank, effects, xpCost
      │  └─ EasyTalentData    "easyTalent"     die            implements DicePoolSource
      ├─ FlawDataBase (abstract)
      │  ├─ FlawData          "flaw"           severity, xpValue
      │  └─ EasyFlawData      "easyFlaw"       die            implements DicePoolSource
      ├─ InjuryData           "injury"         severity (wounded | crippled)
      └─ weapon, armor, item, feature, spell   re-parented, otherwise unchanged

SHEETS (src/module/sheets/)
HandlebarsApplicationMixin(ActorSheetV2)
└─ OddActorSheetBase (abstract)   dice tray, rolling, history, saved rolls, common rolls,
   │                              scroll preservation, avatar picker
   ├─ OddActorSheet               ODD tabs, wounds, armor, weapons, initiative
   └─ OddEasyActorSheet           one page, following the PDF's character sheet (p. 34)

INTERFACES
DicePoolSource  { toPoolEntry(): { label: string; die: string } | null }
RollingActor    { rollSources(key), strainPenalty, commonRolls }
```

### Rules

- **The engine depends only on the abstractions.** The dice tray, roll resolution and enrichers use `RollingActor` and `DicePoolSource`, never a concrete ODD or Easy class.
- **Inheritance for is-a, composition for has-a.** Traits more than one actor type will share (strain, and later NPCs) become schema templates or mixins, following dnd5e's `.mixin(...)`, rather than extra inheritance levels.
- **No abstract class with only one subclass.** Weapon and armor get a base class only when an Easy variant of them exists.
- **At most two levels of our own abstraction** below Foundry's classes.
- **Config stays flat**: `EASY_*` entries go into the existing domain files. No hardcoded game data (existing rule).

### Foundry and TypeScript constraints

1. Registered types are still concrete strings. `system.json` `documentTypes` and `DataModelConfig` list `talent` and `easyTalent` separately.
2. TypeScript has no `static abstract`. Foundry's static hooks (`defineSchema`, `PARTS`, `TABS`) become static properties that subclasses must override; the base implementation throws.
3. Abstract bases go in `src/module/data/abstract/`. The auto-discovery globs (`data/actor/*.ts`, `data/item/*.ts`) would otherwise register them as types.
4. Nested schema extension, such as ODD's `strain` adding fortitude to the base slots, goes through the merge helper rather than an object spread.
5. Each character type only accepts its own item types. `easyCharacter` accepts `easyTalent`, `easyFlaw`, `injury` and the generic `item`; `character` rejects the Easy types. This is checked on drop and on embedded create.

## VTTForge: what we use it for

VTTForge's value here is **version changes**, which come in two kinds. I inspected the published packages (`@vttforge/cli` 0.18.8, `@vttforge/core` 0.20.7, `@vttforge/types` 0.11.1) to confirm each piece.

### Foundry major versions (v13 → v14 now; v15 and later)
`@vttforge/cli`, as a pinned devDependency with npm scripts:
- **`vttforge migrate`** rewrites a v13 project for v14 (manifest `compatibility`, renamed API aliases, and so on). It only **previews by default**; `--write` applies the changes. Its help text already mentions v16 replacements, so it's meant to carry on across majors. We don't use `--data-models`, `--sheets` or `--style sdk`, because they generate code on VTTForge's base classes.
- **`vttforge audit`** runs static checks for breakages that fail silently, e.g. `VTTF-AUDIT-001` `flags.hotReload` shape, `-004` HTMLField without a manifest declaration, `-005` TypeDataModel without a `prepareBaseData` stub, `-007` token attributes not matching the manifest, `-009` subtype without a TYPES label, `-020` release workflow shipping an unbuilt checkout. By default it exits non-zero only on HIGH findings, so it can run in CI as a gate.
- Not used: `vttforge build` and `lint`. semantic-release plus `prepare-release.mjs` already build the zip, and ESLint stays the linter.

### System versions (world data migrations)
`@vttforge/core` as a runtime dependency, but we import **only `createMigrationRunner`**:
- It stores a `schemaVersion` world setting and runs every migration newer than it, in order, as a GM on `ready`. It records progress after each step, so a failed migration can resume. `compatibleVersion` refuses to run on worlds that are too old.
- The package is MIT and declares `sideEffects: false`, so Vite drops everything except the runner and its error class. The error class pulls in VTTForge's full error registry (17 message strings), so the cost is about 12 KB unminified / 3.7 KB gzipped (measured in phase 0).
- Per-document field renames still use Foundry's own `static migrateData`. The runner is for world-wide passes, e.g. rewriting embedded items when a type or schema changes.
- semantic-release stays in charge of the release number. The runner's migration versions follow those release numbers.

### What it can't do: type checking
- **`InferSchema` can't read our schemas.** It only matches VTTForge's own field instances, which carry a `unique symbol` brand (`FieldInstance { [BRAND]: … }`). `foundry.data.fields.*` instances typed by fvtt-types don't have that brand, so `InferSchema<ReturnType<typeof defineCharacterSchema>>` resolves to `never`.
- Finding type holes is done with **type-level tests against fvtt-types** instead: Vitest `expectTypeOf` assertions that each model's inferred `system` has the expected shape, and that no field comes out as `any` or `unknown`. These guard the `CharacterConfigKeyedData`-style manual declarations, which is where our types can currently drift.

### Risk handling
VTTForge is 0.x (a minor bump is breaking), with one maintainer. So: pin exact versions (no `^`), upgrade them deliberately alongside a Foundry major, and keep the runtime footprint limited to the one import. The runner is small enough to vendor if the project stalls.

## Phases

Each phase is one PR into `develop`, and each verification step must pass before the next phase starts.

### 0. Move to Foundry v14
- Add `@vttforge/cli` as an exact-pinned devDependency, with `npm run foundry:audit` and `npm run foundry:migrate` (preview).
- Run the `migrate` preview, review each change, and apply the good ones with `--write`. Then run `audit` and fix its findings, cross-checking against the v14 API docs and dnd5e's v14 code.
- Pin fvtt-types to an exact `14.x-beta` build. Make sure `system.json` ends up at `compatibility: { minimum: 14, verified: 14 }`. Move the Docker image to v14 stable (14.368).
- Fix whatever typecheck breaks under the v14 types.
- Add `audit` to CI and the release gate (non-zero exit on HIGH findings only).
- Add `@vttforge/core` (exact pin) and set up `createMigrationRunner` with an empty migration list: `register()` in `init`, `run()` in `ready` for GMs. The infrastructure is then in place before any phase changes stored data.
- **Verify:** `npm run typecheck`, `lint` and `build` pass; audit has no HIGH findings; the build contains only the runner and its error registry from `@vttforge/core` (check the unminified output); the `odd-rpg.schemaVersion` world setting is registered (it is only written once the first migration exists); smoke test in Foundry v14 (character sheet, rolls, tags, avatar, initiative tracker with Shift+I, combatant drag).

#### Phase 0 findings
- `migrate` only proposed manifest changes. The `compatibility` change was applied; its `"type": "system"` addition was not, because the v14 manifest schema has no top-level `type` and dnd5e doesn't use one.
- Audit false positives, left as they are: `VTTF-AUDIT-005` (the base `TypeDataModel` already defines `prepareBaseData`, and the rule matches source text) and `VTTF-AUDIT-004` on `talent` (the rule reduces the nested `effects.*.body` path to `body`, so it can't match any correct nested path).
- Real fixes from the audit: the talent `htmlFields` entry `effects[].body` became `effects.*.body`, the wildcard form dnd5e uses (`advancement.*.hint`); `styles` moved to the v13+ object form.
- fvtt-types beta bug: `CONFIG.Actor.trackableAttributes` is typed as a single entry, but Foundry keys it by actor type. Worked around with `Object.assign` (no cast).
- `sonarjs/argument-type` is off. It crashes on the v14 `Math` augmentation, and `tsc --strict` already checks argument types.
- CI switches to Node 26 for the audit step only (`@vttforge/cli` requires Node >= 26). Install, lint, typecheck and build stay on Node 22.
- The repo has no Docker config. The only local Foundry container belongs to another project, so moving the Docker image to v14 is left to whoever runs the smoke test.

### Checkpoint: VTTForge base-class spike (after phase 0, before phase 1)
Decides the root of the class hierarchy: our own `OddDataModel` / `OddActorSheetBase`, or VTTForge's `BaseTypeDataModel` / `BaseItemSheet` / `BaseActorSheet`.
- On a throwaway branch off the phase 0 result, add `@vttforge/core` bases for one small type: port the `flaw` data model and the item sheet path it uses to VTTForge's bases.
- Measure:
  - casts and `any`/`unknown` needed where VTTForge's types meet fvtt-types (`this.parent`, `item.system`, sheet context, `DataModelConfig`);
  - new `tsc` errors;
  - whether `InferSchema` replaces the hand-written derived types without casts;
  - how much bundle size it adds (check the unminified output).
- **Adopt VTTForge bases** in phase 1 only if the port needs **no new casts** at the fvtt-types boundary and typecheck passes. Otherwise, **drop the spike**; phase 1 uses our own bases and VTTForge stays limited to the CLI and migration runner.
- **Output:** a short results note in `docs/research/notes/vttforge-spike.md` and an update to decision 6 above. The spike branch is not merged.

### 1. Abstract layer under the existing ODD code, with no behavior change
- Add `OddDataModel`, `OddCharacterDataBase`, `OddItemDataBase`, `TalentDataBase` and `FlawDataBase`, and re-parent the existing models.
- Split `OddActorSheetBase` out of `sheets/actor.ts` (currently 1,189 lines): move the dice tray, rolling, history, saved rolls, common rolls, scroll handling and avatar picker into the base.
- Add the `RollingActor` and `DicePoolSource` interfaces and switch the engine code to them.
- Add Vitest with the first type-level tests for the existing models.
- **Verify:** typecheck, lint, build and tests pass; the ODD smoke test from phase 0 behaves identically.

### 2. Easy data and items
- Config: `EASY_ATTRIBUTES`, `EASY_SKILLS`, `EASY_STRAIN_VALUES` and `EASY_COMMON_ROLLS` in their domain files.
- Models: `EasyCharacterData`, `EasyTalentData`, `EasyFlawData` and `InjuryData`, plus `DataModelConfig`, `system.json` `documentTypes` / `htmlFields`, and lang keys (including TYPES labels, audit rule `-009`).
- Injury rule: when a 3rd `wounded` injury is added, it becomes `crippled` (checked on embedded create).
- Each character type accepts only its own item types (constraint 5).
- Type-level tests for the new models.
- **Verify:** typecheck and tests pass; an Easy actor and each Easy item can be created with the correct defaults; dropping an ODD talent on an Easy character is rejected.

### 3. `OddEasyActorSheet`
- Single page following the PDF's character sheet: header and XP; attributes; skills; talents and flaws with dice; strain slots (F/E/B) with the penalty; injuries; Awareness and Shock rolls; notes.
- Reuse the partials (attribute table, roll entry, strain) through the base sheet; add Easy-specific templates only where the layout differs.
- Clicking a talent or flaw adds its die through `DicePoolSource`. An applicable Wound adds its d10 penalty.
- **Verify:** every roll on p. 34 works (Awareness, Shock, and an attribute + skill + talent pool); the strain penalty follows slots 3–7; a full strain track shows Incapacitated; injury penalties apply.

### 4. Ruleset world setting
- A GM-only world setting, `ruleset: "odd" | "easy"`. It filters which actor and item types the create dialogs offer. Check the exact v14 hook for this against the API docs and dnd5e before implementing.
- Existing actors of the other type stay fully usable; the setting only changes what can be created.
- **Verify:** switching the setting changes the offered types in both directions; actors of both types still open and roll.

## Deferred

- **ODD → ODDEasy conversion** (one-way, creates a new actor and leaves the original). Mapping findings are kept here for when it's picked up:
  - Automatic: strain; skills (ODD categories = Easy skills; the combine rule is to be decided); XP; Awareness/Shock.
  - Needs a ruling from the designer: 8 → 4 attributes (Might ← str+vit, Finesse ← agi+dex, Wits ← cun+int, Spirit ← wil+per; how the two dice become one); flaw severity → die; armor values.
  - Manual: talent dice (the concepts differ); weapon Power (no formula exists).
  - Lossy: hit-location wounds → named injuries (bleeding and bandaged status are lost).
- `easyWeapon` (Power) and Easy armor use. The PDF treats gear as mostly narrative.
- The Odds advancement roller.
- Trackers for Extended and Challenge tests (progress bars, goals, timers).
- NPCs (the PDF describes them as dice pools, not attributes).

## Open questions

- Does ODD's shared engine already apply the 5-dice cap and Hitch/Botch detection? If not, both rulesets need it, so it belongs in phase 1 or a follow-up, not in Easy-only code.
- Should Easy Wounds apply their d10 automatically, or only when the player toggles "applies" per roll? The rule is "if they would hinder you in a Test", which is a GM call.
