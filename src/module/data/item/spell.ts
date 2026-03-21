import { BaseItemDataModel } from "../_base.js";

const { NumberField } = foundry.data.fields;

/** Spell — a castable magical effect. */
export class SpellDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      spellLevel: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
    };
  }
}

export default SpellDataModel;
