import { SKILL_CATEGORIES } from "./skills.js";

export const FLAW_SEVERITIES = {
  minor:    { label: "ODD.Flaw.Severities.minor",    xp: 10,  symbol: "⦻" },
  moderate: { label: "ODD.Flaw.Severities.moderate", xp: 30,  symbol: "⦻⦻" },
  major:    { label: "ODD.Flaw.Severities.major",    xp: 60,  symbol: "⦻⦻⦻" },
} as const;

export type FlawSeverity = keyof typeof FLAW_SEVERITIES;

export { SKILL_CATEGORIES as FLAW_CATEGORIES };
