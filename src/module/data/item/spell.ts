import { BaseItemDataModel, defineBaseItemSchema } from "../_base.js";

const { NumberField } = foundry.data.fields;

function defineSpellSchema() {
  return {
    ...defineBaseItemSchema(),
    spellLevel: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
  };
}

type SpellSchema = ReturnType<typeof defineSpellSchema>;

/** Spell — a castable magical effect. */
export class SpellDataModel extends BaseItemDataModel<SpellSchema> {
  static override defineSchema(): SpellSchema {
    return defineSpellSchema();
  }
}

export default SpellDataModel;
