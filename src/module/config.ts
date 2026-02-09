/**
 * ODD RPG — System Configuration
 *
 * Central source of truth for attribute keys, dice choices, and defaults.
 * The data model, sheet, and templates all derive from these constants.
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

/** Valid dice types → i18n label keys. */
export const DICE_TYPES: Record<string, string> = Object.freeze({
  d4: "ODD.Dice.d4",
  d6: "ODD.Dice.d6",
  d8: "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

/** Default die assigned to new characters. */
export const DEFAULT_DIE = "d6";

/** Aggregate config object attached to CONFIG.ODD at init. */
export const ODD = Object.freeze({
  attributes: ATTRIBUTES,
  diceTypes: DICE_TYPES,
  defaultDie: DEFAULT_DIE,
});
