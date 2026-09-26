# VTTForge base-class spike — as of 2026-09-26

The checkpoint between phase 0 and phase 1 of [the ODDEasy plan](../../plans/oddeasy.md): should the root of odd-rpg's class hierarchy be VTTForge's `BaseTypeDataModel` / `BaseItemSheet` instead of our own bases?

**Verdict: no.** VTTForge's types and fvtt-types don't interoperate at the boundary. The `flaw` model compiles only with an `as unknown as` cast at each consumer, and a VTTForge sheet can't be registered through fvtt-types without a cast either. The adoption rule was "no new casts at the fvtt-types boundary", so phase 1 uses our own bases. VTTForge stays limited to the CLI and the migration runner.

Evidence: local branch `spike/vttforge-flaw` (commit `abebd4b`, not merged or pushed). Versions: `@vttforge/core` 0.20.7, `fvtt-types` 14.366.0-beta.20260925073408.

## What was done

`src/module/data/item/flaw.ts` was rewritten as documented by VTTForge: a `defineFlawSchema` built from `fields()` and passed to `BaseTypeDataModel(defineFlawSchema)`, with `declare`d derived fields (`xpValue`, `symbol`). Nothing else changed, and `DataModelConfig` still lists `flaw: typeof FlawDataModel`.

For the sheet, a probe `class FlawSheet extends BaseItemSheet()` was registered with `DocumentSheetConfig.registerSheet(Item, "odd-rpg", FlawSheet, { types: ["flaw"] })`.

## Results

| Measure | Baseline (phase 0) | Spike |
|---|---|---|
| `tsc` errors, no bridging | 0 | **5**: in `_buildFlawRows`, `item.system` for `flaw` is `never` |
| `tsc` errors, with bridging | 0 | 0, needing 1 `as unknown as FlawDataModel` per consumer |
| `' as '` casts in `src/` | 63 | 64 |
| `as any` / `as unknown` casts | 1 | 2 |
| Lint | 0 errors, 23 warnings | unchanged |
| Bundle (unminified / gzip) | 101.51 KB / 24.11 KB | 103.77 KB / 24.86 KB (+2.3 KB / +0.75 KB) |
| Sheet registration | — | **TS2345**: `typeof FlawSheet` is not an `Application.AnyConstructor \| DocumentSheetV2.AnyConstructor` (missing `_warnedAppV1`, `RENDER_STATES`, `defaultOptions`, `_getInheritanceChain`) |

## Why it fails

- `BaseTypeDataModel(define)` returns a `TypedTypeDataModelCtor<S>`: `new (...args: any[]) => TypedTypeDataModel<S>`. That instance type is built from VTTForge's own `@vttforge/types` surface; it is not a subclass of fvtt-types' `foundry.abstract.TypeDataModel`. fvtt-types resolves `Item.SystemOfType<"flaw">` from `DataModelConfig`, can't read that constructor, and gives `never`.
- Likewise, `BaseItemSheet()` returns a `SheetBaseCtor<ItemLike>` typed against VTTForge's `ItemLike`, not fvtt-types' `ItemSheetV2`, so `registerSheet` rejects it. VTTForge expects its own `registerSystem()` to do the registration, which would mean adopting its runtime registration layer as well.
- Inside the class, inference works as advertised: `this.severity` is `string`, with no errors in `flaw.ts`. But it gains nothing over fvtt-types here. `choices: Object.keys(FLAW_SEVERITIES)` still infers `string`, so the existing `as keyof typeof FLAW_SEVERITIES` cast stays in both the model and the sheet.

## What would make it viable

One of these would have to change:
- VTTForge models are typed as fvtt-types `TypeDataModel` subclasses (or VTTForge ships an fvtt-types adapter), or
- odd-rpg drops fvtt-types for `@vttforge/types` everywhere (documents, sheets, hooks, `CONFIG`). The typing research ([foundry-vtt-typescript-tooling.md](../foundry-vtt-typescript-tooling.md)) already rejected that, because `@vttforge/types` is a subset of the Foundry API tied to the framework.

Re-check this at the next VTTForge minor release or Foundry major version, whichever comes first.
