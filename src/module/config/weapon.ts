export const WEAPON_TYPES: Record<string, string> = Object.freeze({
  melee:  "ODD.Weapon.Type.melee",
  ranged: "ODD.Weapon.Type.ranged",
});

export const WEAPON_HANDS: Record<string, string> = Object.freeze({
  "1h":      "ODD.Weapon.Hands.oneHanded",
  "2h":      "ODD.Weapon.Hands.twoHanded",
  versatile: "ODD.Weapon.Hands.versatile",
});

export const WEAPON_DISTANCE: Record<string, string> = Object.freeze({
  VS: "ODD.Weapon.Distance.veryShort",
  S:  "ODD.Weapon.Distance.short",
  M:  "ODD.Weapon.Distance.medium",
  L:  "ODD.Weapon.Distance.long",
  VL: "ODD.Weapon.Distance.veryLong",
});

export const WEAPON_TEMPO_MIN = 1;
export const WEAPON_TEMPO_MAX = 10;

export const WEAPON_TAGS: readonly string[] = Object.freeze([]);
