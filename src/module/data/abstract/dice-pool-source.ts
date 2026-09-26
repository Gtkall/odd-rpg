import type { PoolEntry } from "./character-base.js";

/** Something that contributes one die to a dice pool when it applies. */
export interface DicePoolSource {
  /** The die to add, or `null` when this source adds none (e.g. a Crippling injury). */
  toPoolEntry(): PoolEntry | null;
}

export function isDicePoolSource(value: object): value is DicePoolSource {
  return "toPoolEntry" in value && typeof value.toPoolEntry === "function";
}
