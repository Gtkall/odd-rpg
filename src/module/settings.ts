import { DEFAULT_RULESET, RULESETS } from "./config/rulesets.js";
import { DEFAULT_CHALLENGE_STATE, OddChallengeTracker } from "./tracker/challenge-tracker.js";

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

  game.settings.register("odd-rpg", "challenge", {
    scope: "world",
    config: false,
    type: Object,
    default: DEFAULT_CHALLENGE_STATE,
    onChange: () => {
      const tracker = OddChallengeTracker.instance;
      if (tracker.rendered) void tracker.render();
    },
  });
}

/** The document types the active ruleset offers in the "Create" dialogs. */
export function creatableTypes(documentName: "Actor" | "Item"): readonly string[] {
  const ruleset = RULESETS[game.settings.get("odd-rpg", "ruleset")];
  return documentName === "Actor" ? ruleset.actorTypes : ruleset.itemTypes;
}
