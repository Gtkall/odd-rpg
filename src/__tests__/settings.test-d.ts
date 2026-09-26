/**
 * Type-level tests for the system settings, run by `npm test`.
 * `creatableTypes` indexes RULESETS with the stored value, so the setting must
 * stay typed as a RulesetKey (the SettingConfig merge in fvtt-config.d.ts).
 */

import { describe, expectTypeOf, it } from "vitest";
import type { RulesetKey } from "../module/config/rulesets.js";

describe("settings", () => {
  it("types the ruleset setting as a RulesetKey", () => {
    expectTypeOf<ReturnType<typeof game.settings.get<"odd-rpg", "ruleset">>>().toEqualTypeOf<RulesetKey>();
  });
});
