import { EASY_ARMOR_DEFAULTS } from "../../config/armor.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { BooleanField, NumberField } = foundry.data.fields;

function defineEasyArmorSchema() {
  return {
    ...defineItemBaseSchema(),
    bulk: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: EASY_ARMOR_DEFAULTS.bulk }),
    protection: new NumberField({
      required: true, nullable: false, integer: true, min: 0, initial: EASY_ARMOR_DEFAULTS.protection,
    }),
    equipped: new BooleanField({ required: true, initial: false }),
  };
}

type EasyArmorSchema = ReturnType<typeof defineEasyArmorSchema>;

/**
 * ODDEasy armor: Protection reduces the Damage of a Hit, and while worn its
 * Bulk fills that many Strain Slots with "B".
 */
export class EasyArmorDataModel extends OddItemDataBase<EasyArmorSchema> {
  static override defineSchema(): EasyArmorSchema {
    return defineEasyArmorSchema();
  }
}

export default EasyArmorDataModel;
