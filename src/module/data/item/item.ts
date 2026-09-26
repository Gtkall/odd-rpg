const { ArrayField, HTMLField, StringField } = foundry.data.fields;

function defineItemSchema() {
  return {
    description: new HTMLField({ required: true, blank: true }),
    notes: new ArrayField(
      new StringField({ required: true, blank: false }),
      { required: true, initial: [] },
    ),
  };
}

type ItemSchema = ReturnType<typeof defineItemSchema>;

/** Generic Item — holds notes (tags) and a description. */
export class ItemDataModel extends foundry.abstract.TypeDataModel<ItemSchema, Item.Implementation> {
  static override defineSchema(): ItemSchema {
    return defineItemSchema();
  }
}

export default ItemDataModel;
