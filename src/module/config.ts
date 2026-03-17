/**
 * ODD RPG — System Configuration
 *
 * Central source of truth for attribute keys, skill keys, dice choices,
 * and defaults. The data model, sheet, and templates all derive from
 * these constants.
 */

/** Attribute abbreviations → i18n label keys. */
export const ATTRIBUTES: Record<string, string> = Object.freeze({
  str: "ODD.Attributes.str",
  cun: "ODD.Attributes.cun",
  agi: "ODD.Attributes.agi",
  int: "ODD.Attributes.int",
  dex: "ODD.Attributes.dex",
  wil: "ODD.Attributes.wil",
  vit: "ODD.Attributes.vit",
  per: "ODD.Attributes.per",
});

/**
 * Skills grouped by category.
 * Each category key maps to an object of skill keys → i18n label keys.
 */
export const SKILLS: Record<string, Record<string, string>> = Object.freeze({
  combat: Object.freeze({
    archery: "ODD.Skills.archery",
    melee: "ODD.Skills.melee",
    reflexes: "ODD.Skills.reflexes",
    shooting: "ODD.Skills.shooting",
    unarmed: "ODD.Skills.unarmed",
  }),
  physical: Object.freeze({
    animals: "ODD.Skills.animals",
    athletics: "ODD.Skills.athletics",
    endurance: "ODD.Skills.endurance",
    stealth: "ODD.Skills.stealth",
    vehicles: "ODD.Skills.vehicles",
  }),
  knowledge: Object.freeze({
    academics: "ODD.Skills.academics",
    medicine: "ODD.Skills.medicine",
    occult: "ODD.Skills.occult",
    science: "ODD.Skills.science",
    technology: "ODD.Skills.technology",
  }),
  social: Object.freeze({
    charm: "ODD.Skills.charm",
    coercion: "ODD.Skills.coercion",
    deception: "ODD.Skills.deception",
    empathy: "ODD.Skills.empathy",
    persuasion: "ODD.Skills.persuasion",
  }),
  mental: Object.freeze({
    art: "ODD.Skills.art",
    investigation: "ODD.Skills.investigation",
    perception: "ODD.Skills.perception",
    resolve: "ODD.Skills.resolve",
    tactics: "ODD.Skills.tactics",
  }),
  special: Object.freeze({
    mana: "ODD.Skills.mana",
  }),
});

/** Skill category i18n label keys. */
export const SKILL_CATEGORIES: Record<string, string> = Object.freeze({
  combat: "ODD.SkillCategories.combat",
  physical: "ODD.SkillCategories.physical",
  knowledge: "ODD.SkillCategories.knowledge",
  social: "ODD.SkillCategories.social",
  mental: "ODD.SkillCategories.mental",
  special: "ODD.SkillCategories.special",
});

/** Valid dice types → i18n label keys. */
export const DICE_TYPES: Record<string, string> = Object.freeze({
  "": "ODD.Dice.none",
  d4: "ODD.Dice.d4",
  d6: "ODD.Dice.d6",
  d8: "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

/** Valid dice types for attributes (no untrained option). */
export const ATTRIBUTE_DICE_TYPES: Record<string, string> = Object.freeze({
  d4: "ODD.Dice.d4",
  d6: "ODD.Dice.d6",
  d8: "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

/** Default die assigned to new characters. */
export const DEFAULT_DIE = "d6";

/* ========================================================================== */
/*  Layout & Roll Configuration                                               */
/* ========================================================================== */

/** Attribute key pairs defining the 2-column layout on the character sheet. */
export const ATTRIBUTE_LAYOUT: readonly (readonly [string, string])[] = Object.freeze([
  ["str", "cun"],
  ["agi", "int"],
  ["dex", "wil"],
  ["vit", "per"],
]);

/** Skill category rows defining the 3-column layout on the character sheet.
 *  Each inner tuple is one row of three category keys. */
export const SKILL_LAYOUT: readonly (readonly [string, string, string])[] = Object.freeze([
  ["combat", "knowledge", "mental"],
  ["physical", "social", "special"],
]);

export type RollSource =
  | { type: "attribute"; key: string }
  | { type: "skill"; category: string; key: string };

export interface CommonRollDef {
  key: string;
  /** i18n label key */
  label: string;
  sources: RollSource[];
}

/** Pre-defined common rolls shown on the character sheet.
 *  Each roll is a pool of attributes and/or skills; talent bonuses are added at runtime. */
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

/** Stamina Roll definition — shown in the strain section header. */
export const STAMINA_ROLL: CommonRollDef = {
  key: "stamina",
  label: "ODD.Sections.staminaRoll",
  sources: [
    { type: "attribute" as const, key: "vit" },
    { type: "attribute" as const, key: "wil" },
    { type: "skill" as const, category: "physical", key: "endurance" },
  ],
};

/* ========================================================================== */
/*  Strain Configuration                                                      */
/* ========================================================================== */

/** Strain slot values → i18n label keys. */
export const STRAIN_VALUES: Record<string, string> = Object.freeze({
  "":   "ODD.Strain.none",
  "F":  "ODD.Strain.fatigue",
  "E":  "ODD.Strain.exhaustion",
  "A":  "ODD.Strain.armor",
  "BL": "ODD.Strain.bleeding",
});

/** Number of default strain slots (before Fortitude bonus). */
export const STRAIN_DEFAULT_SLOT_COUNT = 7;

/** Maximum bonus slots granted by Fortitude I/II/III. */
export const STRAIN_MAX_FORTITUDE_SLOTS = 3;

/**
 * Fatigue penalty die per 0-based index within the DEFAULT slots.
 * Slots 0-1 have no penalty; slots 2-6 carry d4-d12.
 */
export const STRAIN_FATIGUE_PENALTIES: Record<number, string> = Object.freeze({
  2: "d4",
  3: "d6",
  4: "d8",
  5: "d10",
  6: "d12",
});

/** Aggregate config object attached to CONFIG.ODD at init. */
export const ODD = Object.freeze({
  attributes: ATTRIBUTES,
  skills: SKILLS,
  skillCategories: SKILL_CATEGORIES,
  diceTypes: DICE_TYPES,
  attributeDiceTypes: ATTRIBUTE_DICE_TYPES,
  defaultDie: DEFAULT_DIE,
});
