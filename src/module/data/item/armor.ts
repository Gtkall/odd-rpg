import { ARMOR_LOCATIONS } from "../../config/armor.js";

const { ArrayField, BooleanField, HTMLField, NumberField, StringField } = foundry.data.fields;

function defineArmorSchema() {
  return {
    description: new HTMLField({ required: true, blank: true }),
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
export class ArmorDataModel extends foundry.abstract.TypeDataModel<ArmorSchema, Item.Implementation> {
  static override defineSchema(): ArmorSchema {
    return defineArmorSchema();
  }
}

export default ArmorDataModel;
