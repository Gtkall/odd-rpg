/**
 * Shared base class and interfaces for all ODD RPG Item data models.
 */

const { HTMLField } = foundry.data.fields;

export function defineBaseItemSchema() {
  return {
    description: new HTMLField({ required: true, blank: true }),
  };
}

export type BaseItemSchema = ReturnType<typeof defineBaseItemSchema>;

export class BaseItemDataModel<
  Schema extends BaseItemSchema = BaseItemSchema,
> extends foundry.abstract.TypeDataModel<Schema, Item.Implementation> {
  static override defineSchema(): BaseItemSchema {
    return defineBaseItemSchema();
  }
}
