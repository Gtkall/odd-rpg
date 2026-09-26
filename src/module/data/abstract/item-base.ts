/**
 * Base class for every ODD RPG Item data model.
 *
 * Lives outside data/item/ so the auto-discovery glob in odd-rpg.ts does not
 * register it as an Item type.
 */

import type { AnyObject, EmptyObject } from "fvtt-types/utils";
import { OddCharacterDataBase } from "./character-base.js";

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

  /** Refuse item types the owning character does not accept. */
  protected override async _preCreate(
    data: foundry.abstract.TypeDataModel.ParentAssignmentType<Schema, Item.Implementation>,
    options: foundry.abstract.Document.Database.PreCreateOptionsForName<"Item">,
    user: User.Stored,
  ): Promise<boolean | void> {
    if ((await super._preCreate(data, options, user)) === false) return false;
    const item = this.parent;
    const actor = item.actor;
    if (actor?.system instanceof OddCharacterDataBase && !actor.system.acceptsItemType(item.type)) {
      ui.notifications.warn(game.i18n.format("ODD.Item.notAccepted", {
        type:  game.i18n.localize(`TYPES.Item.${item.type}`),
        actor: game.i18n.localize(`TYPES.Actor.${actor.type}`),
      }));
      return false;
    }
  }
}
