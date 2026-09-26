import { DEFAULT_RULESET, RULESETS } from "./config/rulesets.js";

export function registerSettings(): void {
  game.settings.register("odd-rpg", "ruleset", {
    name: "ODD.Settings.ruleset.name",
    hint: "ODD.Settings.ruleset.hint",
    scope: "world",
    config: true,
    type: String,
    choices: Object.fromEntries(Object.entries(RULESETS).map(([key, def]) => [key, def.label])),
    default: DEFAULT_RULESET,
  });
}

/** The document types the active ruleset offers in the "Create" dialogs. */
export function creatableTypes(documentName: "Actor" | "Item"): readonly string[] {
  const ruleset = RULESETS[game.settings.get("odd-rpg", "ruleset")];
  return documentName === "Actor" ? ruleset.actorTypes : ruleset.itemTypes;
}
