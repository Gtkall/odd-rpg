import { DICE_POOL_CAP, DIE_STEPS } from "../config/dice.js";

/** The number of faces on a die such as "d8" or "-d8". */
export function dieFaces(die: string): number {
  return Number(/d(\d+)/.exec(die)?.[1] ?? 0);
}

/** The die one step larger, e.g. "d8" → "d10". A d12 stays a d12. */
export function nextDieStep(die: string): string {
  return DIE_STEPS[Math.min(DIE_STEPS.indexOf(die) + 1, DIE_STEPS.length - 1)];
}

/**
 * Indices of the pool dice a Standard Test drops: it rolls only the
 * DICE_POOL_CAP largest Bonus dice. A newer die of the same size replaces an
 * older one. Penalty dice ("-d6") don't count toward the cap and never drop.
 */
export function droppedPoolIndices(dice: readonly string[], cap = DICE_POOL_CAP): Set<number> {
  const bonus = dice.flatMap((die, index) =>
    die.startsWith("-") ? [] : [{ index, faces: dieFaces(die) }],
  );
  bonus.sort((a, b) => a.faces - b.faces || a.index - b.index);
  return new Set(bonus.slice(0, Math.max(0, bonus.length - cap)).map((b) => b.index));
}
