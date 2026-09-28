import { DICE_POOL_CAP } from "../config/dice.js";

/**
 * Indices of the pool dice a Standard Test drops: it rolls only the
 * DICE_POOL_CAP largest Bonus dice. A newer die of the same size replaces an
 * older one. Penalty dice ("-d6") don't count toward the cap and never drop.
 */
export function droppedPoolIndices(dice: readonly string[], cap = DICE_POOL_CAP): Set<number> {
  const bonus = dice.flatMap((die, index) =>
    die.startsWith("-") ? [] : [{ index, faces: Number(/d(\d+)/.exec(die)?.[1] ?? 0) }],
  );
  bonus.sort((a, b) => a.faces - b.faces || a.index - b.index);
  return new Set(bonus.slice(0, Math.max(0, bonus.length - cap)).map((b) => b.index));
}
