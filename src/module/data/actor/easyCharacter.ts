/**
 * ODDEasy Character — the rules-lite character type.
 *
 * Schema mirrors the ODDEasy character sheet (p. 34):
 * - Base info (from OddCharacterDataBase): player name, XP, biography, saved rolls
 * - Attributes: Might, Finesse, Wits, Spirit
 * - Skills: Combat, Knowledge, Mental, Physical, Social (untrained = no die)
 * - Strain: 7 slots of Fatigue, Exhaustion or armor Bulk
 * Talents, Flaws and Injuries are items.
 */

import { ATTRIBUTE_DICE_TYPES, DEFAULT_DIE, EASY_ATTRIBUTES } from "../../config/attributes.js";
import { EASY_SKILLS } from "../../config/skills.js";
import { DICE_TYPES } from "../../config/dice.js";
import { EASY_STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT } from "../../config/strain.js";
import { EASY_COMMON_ROLLS, type CommonRollDef, type RollSource } from "../../config/rolls.js";
import { EASY_ITEM_TYPES } from "../../config/item-types.js";
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

  get commonRolls(): readonly CommonRollDef[] {
    return EASY_COMMON_ROLLS;
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
