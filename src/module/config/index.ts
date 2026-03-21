import { ATTRIBUTES, ATTRIBUTE_DICE_TYPES, DEFAULT_DIE } from "./attributes.js";
import { SKILLS, SKILL_CATEGORIES } from "./skills.js";
import { DICE_TYPES } from "./dice.js";

/** Aggregate config object attached to CONFIG.ODD at init. */
export const ODD = Object.freeze({
  attributes: ATTRIBUTES,
  skills: SKILLS,
  skillCategories: SKILL_CATEGORIES,
  diceTypes: DICE_TYPES,
  attributeDiceTypes: ATTRIBUTE_DICE_TYPES,
  defaultDie: DEFAULT_DIE,
});
