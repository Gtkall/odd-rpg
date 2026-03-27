import type { OddItemBase } from "../_base.js";

const { ArrayField, HTMLField, StringField } = foundry.data.fields;

/** Generic Item — holds notes (tags) and a description. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ItemDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      notes: new ArrayField(
        new StringField({ required: true, blank: false }),
        { required: true, initial: [] },
      ),
    };
  }
}

export interface ItemSystemData extends OddItemBase {
  notes: string[];
}

export default ItemDataModel;
