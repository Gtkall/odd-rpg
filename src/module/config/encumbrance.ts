export interface EncumbranceLevelDef {
  label: string;
  penalty: string | null;
  maxII: number;
  strain: number;
}

export const ENCUMBRANCE_LEVELS: Record<string, EncumbranceLevelDef> = Object.freeze({
  none:     { label: "ODD.Encumbrance.none",     penalty: null,  maxII: 0,  strain: 0 },
  light:    { label: "ODD.Encumbrance.light",    penalty: "d6",  maxII: -1, strain: 1 },
  moderate: { label: "ODD.Encumbrance.moderate", penalty: "d10", maxII: -2, strain: 2 },
  heavy:    { label: "ODD.Encumbrance.heavy",    penalty: "d12", maxII: -3, strain: 3 },
});
