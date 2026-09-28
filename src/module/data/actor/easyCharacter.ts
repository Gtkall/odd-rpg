/**
 * ODDEasy Character — the rules-lite character type.
 *
 * Schema mirrors the ODDEasy character sheet (p. 34):
 * - Base info (from OddCharacterDataBase): player name, XP, biography, saved rolls
 * - Attributes: Might, Finesse, Wits, Spirit
 * - Skills: Combat, Knowledge, Mental, Physical, Social (untrained = no die)
 * - Strain: 7 slots of Fatigue or Exhaustion; worn armor's Bulk fills the leftmost ones
 * Talents, Flaws, Injuries and armor are items.
 */

import { ATTRIBUTE_DICE_TYPES, DEFAULT_DIE, EASY_ATTRIBUTES } from "../../config/attributes.js";
import { EASY_SKILLS } from "../../config/skills.js";
import { DICE_TYPES } from "../../config/dice.js";
import {
  EASY_BULK_SLOT, EASY_STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT, STRAIN_FATIGUE_PENALTIES,
} from "../../config/strain.js";
import { EASY_COMMON_ROLLS, type CommonRollDef, type RollSource } from "../../config/rolls.js";
import { EASY_ITEM_TYPES } from "../../config/item-types.js";
import { isItemType } from "../../utils/item-type.js";
import {
  OddCharacterDataBase, defineCharacterBaseSchema,
  type CharacterBaseKeyedData, type PoolEntry, type RollingActor,
} from "../abstract/character-base.js";

const { ArrayField, SchemaField, StringField } = foundry.data.fields;

function defineEasyCharacterSchema() {
  return {
    ...defineCharacterBaseSchema(),
    attributes: new SchemaField(
      Object.fromEntries(
        Object.keys(EASY_ATTRIBUTES).map((key) => [
          key,
          new StringField({ required: true, initial: DEFAULT_DIE, choices: Object.keys(ATTRIBUTE_DICE_TYPES) }),
        ] as const),
      ),
    ),
    skills: new SchemaField(
      Object.fromEntries(
        Object.keys(EASY_SKILLS).map((key) => [
          key,
          new StringField({ required: true, blank: true, initial: "", choices: Object.keys(DICE_TYPES) }),
        ] as const),
      ),
    ),
    strain: new SchemaField({
      slots: new ArrayField(
        new StringField({ required: true, blank: true, initial: "", choices: Object.keys(EASY_STRAIN_VALUES) }),
        { initial: Array(STRAIN_DEFAULT_SLOT_COUNT).fill("") as string[] },
      ),
    }),
  };
}

type EasyCharacterSchema = ReturnType<typeof defineEasyCharacterSchema>;

// fvtt-types infers a SchemaField whose keys come from config (via
// Object.fromEntries) as `{}`, so the real shapes of those fields are declared here.
type EasyCharacterKeyedData = CharacterBaseKeyedData & {
  attributes: Record<string, string>;
  skills:     Record<string, string>;
};

export class EasyCharacterDataModel
  extends OddCharacterDataBase<EasyCharacterSchema, EasyCharacterKeyedData>
  implements RollingActor {
  static override defineSchema(): EasyCharacterSchema {
    return defineEasyCharacterSchema();
  }

  /**
   * Strain Slots were once set to Bulk by hand; worn armor fills them now, so
   * a stored "B" is cleared rather than counted twice.
   */
  static override migrateData(source: object): object {
    const strain = (source as { strain?: { slots?: unknown } }).strain;
    if (Array.isArray(strain?.slots)) {
      strain.slots = (strain.slots as unknown[]).map((value) => (value === EASY_BULK_SLOT ? "" : value));
    }
    return super.migrateData(source);
  }

  get commonRolls(): readonly CommonRollDef[] {
    return EASY_COMMON_ROLLS;
  }

  /** How many Strain Slots worn armor fills with Bulk, at most every slot. */
  get bulkSlots(): number {
    let bulk = 0;
    for (const item of this.parent.items) {
      if (isItemType(item, "easyArmor") && item.system.equipped) bulk += item.system.bulk;
    }
    return Math.min(bulk, this.strain.slots.length);
  }

  /**
   * Every Strain Slot as it counts: Bulk in the leftmost slots, then the stored
   * slots. Stored slots pushed past the end are hidden, not lost; they return
   * when the armor comes off.
   */
  get strainSlotValues(): string[] {
    const bulk = this.bulkSlots;
    const stored = this.strain.slots.slice(0, this.strain.slots.length - bulk);
    return [...Array<string>(bulk).fill(EASY_BULK_SLOT), ...stored];
  }

  /** Strain Penalty die for the filled slots: none below three, d4 at three up to d12 when full. */
  get strainPenalty(): string | null {
    const filled = this.strainSlotValues.filter(Boolean).length;
    return STRAIN_FATIGUE_PENALTIES[filled - 1] ?? null;
  }

  /** With no empty slot left, the next Fatigue or Exhaustion leaves the character Incapacitated. */
  get isStrainFull(): boolean {
    return this.strainSlotValues.every(Boolean);
  }

  acceptsItemType(type: string): boolean {
    return EASY_ITEM_TYPES.includes(type);
  }

  /** Skills are a flat list, so a skill source's category (if any) is ignored. */
  resolveRollSource(source: RollSource): PoolEntry {
    if (source.type === "attribute") {
      return {
        label: game.i18n.localize(EASY_ATTRIBUTES[source.key] ?? source.key),
        die: this.attributes[source.key] ?? "",
      };
    }
    return {
      label: game.i18n.localize(EASY_SKILLS[source.key] ?? source.key),
      die: this.skills[source.key] ?? "",
    };
  }
}

export default EasyCharacterDataModel;
