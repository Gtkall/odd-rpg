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

export const SKILL_CATEGORIES: Record<string, string> = Object.freeze({
  combat: "ODD.SkillCategories.combat",
  physical: "ODD.SkillCategories.physical",
  knowledge: "ODD.SkillCategories.knowledge",
  social: "ODD.SkillCategories.social",
  mental: "ODD.SkillCategories.mental",
  special: "ODD.SkillCategories.special",
});

/** Skill category rows defining the 3-column layout on the character sheet. */
export const SKILL_LAYOUT: readonly (readonly [string, string, string])[] = Object.freeze([
  ["combat", "knowledge", "mental"],
  ["physical", "social", "special"],
]);

/**
 * ODDEasy's five broad skills. They are ODD's skill categories, so they reuse
 * the category labels. A character may have no die in a skill (untrained).
 */
export const EASY_SKILLS: Record<string, string> = Object.freeze({
  combat:    "ODD.SkillCategories.combat",
  knowledge: "ODD.SkillCategories.knowledge",
  mental:    "ODD.SkillCategories.mental",
  physical:  "ODD.SkillCategories.physical",
  social:    "ODD.SkillCategories.social",
});
