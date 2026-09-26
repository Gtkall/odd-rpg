/**
 * Base class for items that are a named die, added to a dice pool when they
 * apply: ODDEasy's Talents (a Bonus) and Flaws (a Penalty).
 */

import { ATTRIBUTE_DICE_TYPES, DEFAULT_DIE } from "../../config/attributes.js";
import type { PoolEntry } from "./character-base.js";
import type { DicePoolSource } from "./dice-pool-source.js";
import { OddItemDataBase, defineItemBaseSchema } from "./item-base.js";

const { StringField } = foundry.data.fields;

function defineDieTraitSchema() {
  return {
    ...defineItemBaseSchema(),
    die: new StringField({ required: true, initial: DEFAULT_DIE, choices: Object.keys(ATTRIBUTE_DICE_TYPES) }),
  };
}

type DieTraitSchema = ReturnType<typeof defineDieTraitSchema>;

export abstract class DieTraitDataBase extends OddItemDataBase<DieTraitSchema> implements DicePoolSource {
  static override defineSchema(): DieTraitSchema {
    return defineDieTraitSchema();
  }

  /** Whether the die counts against the roller (a Penalty) rather than for them (a Bonus). */
  protected abstract readonly isPenalty: boolean;

  /** A penalty die is prefixed with "-", as the dice pool expects. */
  toPoolEntry(): PoolEntry {
    return { label: this.parent.name, die: this.isPenalty ? `-${this.die}` : this.die };
  }
}
