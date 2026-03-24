import { SKILL_CATEGORIES } from "./skills.js";

export { SKILL_CATEGORIES as TALENT_CATEGORIES };

export const TALENT_TYPES = {
  main:      "ODD.Talent.Types.main",
  minorSide: "ODD.Talent.Types.minorSide",
  majorSide: "ODD.Talent.Types.majorSide",
} as const;

export type TalentType = keyof typeof TALENT_TYPES;

export const TALENT_XP_COSTS: Record<string, number> = {
  "main:I":   5,
  "main:II":  15,
  "main:III": 25,
  "minorSide": 10,
  "majorSide": 20,
};

export const TALENT_RANKS = {
  I:   "ODD.Talent.Ranks.I",
  II:  "ODD.Talent.Ranks.II",
  III: "ODD.Talent.Ranks.III",
} as const;

export type TalentRank = keyof typeof TALENT_RANKS;
