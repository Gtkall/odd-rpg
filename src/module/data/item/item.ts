import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { ArrayField, StringField } = foundry.data.fields;

function defineItemSchema() {
  return {
    ...defineItemBaseSchema(),
    notes: new ArrayField(
      new StringField({ required: true, blank: false }),
      { required: true, initial: [] },
    ),
  };
}

type ItemSchema = ReturnType<typeof defineItemSchema>;

/** Generic Item — holds notes (tags) and a description. */
export class ItemDataModel extends OddItemDataBase<ItemSchema> {
  static override defineSchema(): ItemSchema {
    return defineItemSchema();
  }
}

export default ItemDataModel;
