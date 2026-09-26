/**
 * Base class for every ODD RPG Item data model.
 *
 * Lives outside data/item/ so the auto-discovery glob in odd-rpg.ts does not
 * register it as an Item type.
 */

import type { AnyObject, EmptyObject } from "fvtt-types/utils";

const { HTMLField } = foundry.data.fields;

export function defineItemBaseSchema() {
  return {
    description: new HTMLField({ required: true, blank: true }),
  };
}

export type ItemBaseSchema = ReturnType<typeof defineItemBaseSchema>;

export abstract class OddItemDataBase<
  Schema extends ItemBaseSchema = ItemBaseSchema,
  DerivedData extends AnyObject = EmptyObject,
> extends foundry.abstract.TypeDataModel<Schema, Item.Implementation, EmptyObject, DerivedData> {
  static override defineSchema(): ItemBaseSchema {
    return defineItemBaseSchema();
  }
}
