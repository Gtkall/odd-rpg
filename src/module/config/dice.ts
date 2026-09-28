export const DICE_TYPES: Record<string, string> = Object.freeze({
  "": "ODD.Dice.none",
  d4: "ODD.Dice.d4",
  d6: "ODD.Dice.d6",
  d8: "ODD.Dice.d8",
  d10: "ODD.Dice.d10",
  d12: "ODD.Dice.d12",
});

/** Die sizes from smallest to largest, e.g. for stepping a die up. */
export const DIE_STEPS: readonly string[] = Object.freeze(Object.keys(DICE_TYPES).filter(Boolean));

/** The most Bonus dice a Standard Test rolls; the rest of the pool is dropped. */
export const DICE_POOL_CAP = 5;
