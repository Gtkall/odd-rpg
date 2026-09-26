import { ARMOR_LOCATIONS } from "../../config/armor.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { ArrayField, BooleanField, NumberField, StringField } = foundry.data.fields;

function defineArmorSchema() {
  return {
    ...defineItemBaseSchema(),
    bulk: new NumberField({ required: true, min: 0, initial: 0 }),
    protection: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    location: new ArrayField(
      new StringField({ required: true, blank: false, choices: Object.keys(ARMOR_LOCATIONS) }),
      { required: true, initial: [] },
    ),
    notes: new ArrayField(
      new StringField({ required: true, blank: false }),
      { required: true, initial: [] },
    ),
    equipped: new BooleanField({ required: true, initial: false }),
  };
}

type ArmorSchema = ReturnType<typeof defineArmorSchema>;

/** Armor / Shield — protective equipment with body-location coverage. */
export class ArmorDataModel extends OddItemDataBase<ArmorSchema> {
  static override defineSchema(): ArmorSchema {
    return defineArmorSchema();
  }
}

export default ArmorDataModel;
