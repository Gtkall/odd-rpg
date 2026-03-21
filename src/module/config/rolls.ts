export type RollSource =
  | { type: "attribute"; key: string }
  | { type: "skill"; category: string; key: string };

export interface CommonRollDef {
  key: string;
  label: string;
  sources: RollSource[];
}

export const COMMON_ROLLS: readonly CommonRollDef[] = Object.freeze([
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

export const STAMINA_ROLL: CommonRollDef = {
  key: "stamina",
  label: "ODD.Sections.staminaRoll",
  sources: [
    { type: "attribute" as const, key: "vit" },
    { type: "attribute" as const, key: "wil" },
    { type: "skill" as const, category: "physical", key: "endurance" },
  ],
};
