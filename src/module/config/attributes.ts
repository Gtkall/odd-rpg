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

export const ATTRIBUTE_DICE_TYPES: Record<string, string> = Object.freeze({
  d4: "ODD.Dice.d4",
  d6: "ODD.Dice.d6",
  d8: "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

export const DEFAULT_DIE = "d6";

/** Attribute key pairs defining the 2-column layout on the character sheet. */
export const ATTRIBUTE_LAYOUT: readonly (readonly [string, string])[] = Object.freeze([
  ["str", "cun"],
  ["agi", "int"],
  ["dex", "wil"],
  ["vit", "per"],
]);
