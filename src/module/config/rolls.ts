export type RollSource =
  | { type: "attribute"; key: string }
  | { type: "skill"; category: string; key: string };

export type RollResolution = "sum" | "keepHighest";

export interface CommonRollDef {
  key: string;
  label: string;
  sources: RollSource[];
  /** True for rolls that appear in a dedicated sheet section — excluded from the Common Rolls panel. */
  dedicated?: boolean;
  /**
   * How the dice pool is resolved.
   * - "sum": add all dice (default)
   * - "keepHighest": keep the single highest die (Foundry pool `{...}kh1` syntax)
   */
  rollResolution?: RollResolution;
}

export const COMMON_ROLLS: readonly CommonRollDef[] = Object.freeze([
  {
    key: "initiative",
    label: "ODD.Rolls.initiative",
    dedicated: true,
    rollResolution: "keepHighest",
    sources: [
      { type: "attribute", key: "agi" },
      { type: "attribute", key: "cun" },
      { type: "skill", category: "combat", key: "reflexes" },
    ],
  },
  {
    key: "stamina",
    label: "ODD.Sections.staminaRoll",
    dedicated: true,
    sources: [
      { type: "attribute", key: "vit" },
      { type: "attribute", key: "wil" },
      { type: "skill", category: "physical", key: "endurance" },
    ],
  },
  {
    key: "awareness",
    label: "ODD.Rolls.awareness",
    sources: [
      { type: "attribute", key: "cun" },
      { type: "skill", category: "mental", key: "perception" },
    ],
  },
  {
    key: "fear",
    label: "ODD.Rolls.fear",
    sources: [
      { type: "attribute", key: "wil" },
      { type: "skill", category: "mental", key: "resolve" },
    ],
  },
  {
    key: "selfControl",
    label: "ODD.Rolls.selfControl",
    sources: [
      { type: "attribute", key: "int" },
      { type: "attribute", key: "wil" },
      { type: "skill", category: "mental", key: "resolve" },
    ],
  },
]);

/** Convenience accessors for rolls that also appear in dedicated sheet sections. */
export const STAMINA_ROLL = COMMON_ROLLS.find((r) => r.key === "stamina")!;
export const INITIATIVE_ROLL = COMMON_ROLLS.find((r) => r.key === "initiative")!;
