import type { EasyStrainKind } from "../../config/strain.js";

/** A character that fills Strain Slots, and so can Push Yourself on a Test. */
export interface StrainSufferer {
  /** Fills a Strain Slot. Resolves false, changing nothing, when no slot is empty. */
  sufferStrain(kind: EasyStrainKind): Promise<boolean>;
}

export function isStrainSufferer(value: object): value is StrainSufferer {
  return "sufferStrain" in value && typeof value.sufferStrain === "function";
}
