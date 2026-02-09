/**
 * ODD RPG — Sheet classes
 *
 * ActorSheet and ItemSheet subclasses that render the Handlebars templates
 * and handle user interaction.
 */

import { ATTRIBUTES, DICE_TYPES } from "./config";

/**
 * Character sheet for ODD RPG Actors.
 */
export class OddActorSheet extends ActorSheet {
  static override get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["odd-rpg", "sheet", "actor", "character"],
      template: "systems/odd-rpg/templates/actor/character-sheet.hbs",
      width: 600,
      height: 680,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  override getData() {
    const context = super.getData() as any;
    const actorData = context.data;

    // Expose system data at the top level for template convenience.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Attribute config for the template.
    context.attributeConfig = ATTRIBUTES;
    context.diceTypes = DICE_TYPES;

    // Separate owned items by type for the template.
    context.items =
      actorData.items?.filter((i: any) => i.type === "item") ?? [];
    context.features =
      actorData.items?.filter((i: any) => i.type === "feature") ?? [];
    context.spells =
      actorData.items?.filter((i: any) => i.type === "spell") ?? [];

    return context;
  }

  override activateListeners(html: any) {
    super.activateListeners(html);

    // Only allow editing for owners.
    if (!this.isEditable) return;

    // Delete owned item
    html.on("click", ".item-delete", (ev: Event) => {
      const li = (ev.currentTarget as HTMLElement).closest(
        ".item",
      ) as HTMLElement;
      const itemId = li?.dataset.itemId;
      if (itemId) this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // Edit owned item
    html.on("click", ".item-edit", (ev: Event) => {
      const li = (ev.currentTarget as HTMLElement).closest(
        ".item",
      ) as HTMLElement;
      const itemId = li?.dataset.itemId;
      if (itemId) {
        const item = this.actor.items.get(itemId);
        item?.sheet?.render(true);
      }
    });
  }
}

/**
 * Sheet for ODD RPG Items.
 */
export class OddItemSheet extends ItemSheet {
  static override get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["odd-rpg", "sheet", "item"],
      template: "systems/odd-rpg/templates/item/item-sheet.hbs",
      width: 480,
      height: 400,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  override getData() {
    const context = super.getData() as any;
    context.system = context.data.system;
    return context;
  }
}
