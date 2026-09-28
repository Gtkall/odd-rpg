export const ARMOR_LOCATIONS: Record<string, string> = Object.freeze({
  head:     "ODD.Armor.Location.head",
  torso:    "ODD.Armor.Location.torso",
  oneArm:   "ODD.Armor.Location.oneArm",
  bothArms: "ODD.Armor.Location.bothArms",
  oneLeg:   "ODD.Armor.Location.oneLeg",
  bothLegs: "ODD.Armor.Location.bothLegs",
});

/** A new ODDEasy armor starts as Light armor (Bulk 1, Protection 10). */
export const EASY_ARMOR_DEFAULTS = Object.freeze({ bulk: 1, protection: 10 });
