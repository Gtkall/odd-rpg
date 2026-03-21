export const STRAIN_VALUES: Record<string, string> = Object.freeze({
  "":   "ODD.Strain.none",
  "F":  "ODD.Strain.fatigue",
  "E":  "ODD.Strain.exhaustion",
  "A":  "ODD.Strain.armor",
  "BL": "ODD.Strain.bleeding",
});

export const STRAIN_DEFAULT_SLOT_COUNT = 7;
export const STRAIN_MAX_FORTITUDE_SLOTS = 3;

export const STRAIN_FATIGUE_PENALTIES: Record<number, string> = Object.freeze({
  2: "d4",
  3: "d6",
  4: "d8",
  5: "d10",
  6: "d12",
});
