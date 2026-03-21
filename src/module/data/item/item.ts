import { BaseItemDataModel } from "../_base.js";

const { NumberField } = foundry.data.fields;

/** Generic Item — equipment, consumable, loot, etc. */
export class ItemDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      quantity: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      weight: new NumberField({ required: true, min: 0, initial: 0 }),
    };
  }
}

export default ItemDataModel;
