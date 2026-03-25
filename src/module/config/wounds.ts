export type WoundLocationKey = "head" | "rightArm" | "leftArm" | "torso" | "rightLeg" | "leftLeg";
export type WoundBaseState  = "uninjured" | "wounded" | "crippled";
export type WoundSubStatus  = "blunt" | "bleeding" | "bandaged";

export interface WoundLocationDef {
  label:          string; // i18n key
  rangeMin:       number;
  rangeMax:       number;
  /** SVG element id that corresponds to this location */
  svgRegion:      string;
  rangeFootnote?: string; // shown as asterisk/note (e.g. torso ranged overlap)
  woundedEffect:  string; // i18n key
  crippledEffect: string; // i18n key
}

/**
 * Hit location table (d20).  "Right" / "Left" are from the *character's* POV;
 * svgRegion maps to the body-diagram SVG element ids which are from the
 * *viewer's* POV (character's right arm is on the viewer's left side).
 */
export const HIT_LOCATIONS: Record<WoundLocationKey, WoundLocationDef> = {
  head: {
    label:          "ODD.Wounds.Locations.head",
    rangeMin:       18, rangeMax: 20,
    svgRegion:      "region-head",
    woundedEffect:  "ODD.Wounds.Effects.headWounded",
    crippledEffect: "ODD.Wounds.Effects.headCrippled",
  },
  rightArm: {
    label:          "ODD.Wounds.Locations.rightArm",
    rangeMin:       15, rangeMax: 17,
    svgRegion:      "region-left-arm", // viewer's left = character's right
    woundedEffect:  "ODD.Wounds.Effects.armWounded",
    crippledEffect: "ODD.Wounds.Effects.armCrippled",
  },
  leftArm: {
    label:          "ODD.Wounds.Locations.leftArm",
    rangeMin:       12, rangeMax: 14,
    svgRegion:      "region-right-arm", // viewer's right = character's left
    woundedEffect:  "ODD.Wounds.Effects.armWounded",
    crippledEffect: "ODD.Wounds.Effects.armCrippled",
  },
  torso: {
    label:          "ODD.Wounds.Locations.torso",
    rangeMin:       7,  rangeMax: 11,
    svgRegion:      "region-torso",
    rangeFootnote:  "ODD.Wounds.TorsoRangedNote",
    woundedEffect:  "ODD.Wounds.Effects.torsoWounded",
    crippledEffect: "ODD.Wounds.Effects.torsoCrippled",
  },
  rightLeg: {
    label:          "ODD.Wounds.Locations.rightLeg",
    rangeMin:       4,  rangeMax: 6,
    svgRegion:      "region-left-leg", // viewer's left = character's right
    woundedEffect:  "ODD.Wounds.Effects.legWounded",
    crippledEffect: "ODD.Wounds.Effects.legCrippled",
  },
  leftLeg: {
    label:          "ODD.Wounds.Locations.leftLeg",
    rangeMin:       1,  rangeMax: 3,
    svgRegion:      "region-right-leg", // viewer's right = character's left
    woundedEffect:  "ODD.Wounds.Effects.legWounded",
    crippledEffect: "ODD.Wounds.Effects.legCrippled",
  },
};

/** Display order for the tracker table (top to bottom) */
export const HIT_LOCATION_ORDER: WoundLocationKey[] = [
  "head", "rightArm", "leftArm", "torso", "rightLeg", "leftLeg",
];

export const WOUND_BASE_STATES: Record<WoundBaseState, string> = {
  uninjured: "ODD.Wounds.States.uninjured",
  wounded:   "ODD.Wounds.States.wounded",
  crippled:  "ODD.Wounds.States.crippled",
};

export const WOUND_SUB_STATUSES: Record<WoundSubStatus, string> = {
  blunt:    "ODD.Wounds.SubStatuses.blunt",
  bleeding: "ODD.Wounds.SubStatuses.bleeding",
  bandaged: "ODD.Wounds.SubStatuses.bandaged",
};

export const PAIN_PENALTY_DICE: Record<string, string> = Object.freeze({
  d4:  "ODD.Dice.d4",
  d6:  "ODD.Dice.d6",
  d8:  "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

export const PAIN_PENALTY_DEFAULT = "d10";

/**
 * Resolve a d20 roll to a hit location.
 * Pass `isRanged: true` to apply the ranged overlap rule where rolls
 * 3, 6, 12, 15, 18 map to Torso instead of their normal location.
 */
export function resolveHitLocation(roll: number, isRanged = false): WoundLocationKey {
  if (isRanged && [3, 6, 12, 15, 18].includes(roll)) return "torso";
  for (const key of HIT_LOCATION_ORDER) {
    const def = HIT_LOCATIONS[key];
    if (roll >= def.rangeMin && roll <= def.rangeMax) return key;
  }
  return "torso";
}
