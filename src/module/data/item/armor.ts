import { ARMOR_LOCATIONS } from "../../config/armor.js";
import type { OddItemBase } from "../_base.js";

const { ArrayField, BooleanField, HTMLField, NumberField, StringField } = foundry.data.fields;

/** Armor / Shield — protective equipment with body-location coverage. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ArmorDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  static override defineSchema() {
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
}

export interface ArmorSystemData extends OddItemBase {
  equipped: boolean;
  bulk: number;
  protection: number;
  location: string[];
}

export default ArmorDataModel;
