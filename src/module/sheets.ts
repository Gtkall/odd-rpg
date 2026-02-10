/**
 * ODD RPG — Sheet classes
 *
 * ActorSheet and ItemSheet subclasses that render the Handlebars templates
 * and handle user interaction.
 */

import { ATTRIBUTES, DICE_TYPES } from "./config";

const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Character sheet for ODD RPG Actors.
 */
export class OddActorSheet extends (HandlebarsApplicationMixin(ActorSheetV2) as typeof ActorSheetV2) {
  static override DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "actor", "character"],
    position: {
      width: 600,
      height: 680,
    },
  };

  static override PARTS = {
    header: {
      template: "systems/odd-rpg/templates/actor/character-header.hbs",
    },
    nav: {
      template: "systems/odd-rpg/templates/actor/character-nav.hbs",
    },
    attributes: {
      template: "systems/odd-rpg/templates/actor/tabs/character-attributes.hbs",
      scrollable: [""],
    },
    items: {
      template: "systems/odd-rpg/templates/actor/tabs/character-items.hbs",
      scrollable: [""],
    },
    spells: {
      template: "systems/odd-rpg/templates/actor/tabs/character-spells.hbs",
      scrollable: [""],
    },
    biography: {
      template: "systems/odd-rpg/templates/actor/tabs/character-biography.hbs",
      scrollable: [""],
    },
  };

  static override TABS = {
    primary: {
      initial: "attributes",
      tabs: [
        { id: "attributes", label: "Attributes" },
        { id: "items", label: "Items" },
        { id: "spells", label: "Spells" },
        { id: "biography", label: "Biography" },
      ],
    },
  };

  override tabGroups = {
    primary: "attributes",
  };

  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const actor = this.document;

    // Attribute config for the template
    const attributeConfig = ATTRIBUTES;
    const diceTypes = DICE_TYPES;

    // Separate owned items by type for the template
    const items = actor.items.filter((i: any) => i.type === "item");
    const features = actor.items.filter((i: any) => i.type === "feature");
    const spells = actor.items.filter((i: any) => i.type === "spell");

    return {
      ...context,
      actor,
      system: actor.system,
      flags: actor.flags,
      attributeConfig,
      diceTypes,
      items,
      features,
      spells,
    };
  }

  async _preparePartContext(partId: string, context: any) {
    switch (partId) {
      case "nav":
        // Prepare tabs with active state
        const TABS = (this.constructor as typeof OddActorSheet).TABS;
        context.tabs = TABS.primary.tabs.map((tab: any) => ({
          ...tab,
          active: this.tabGroups.primary === tab.id,
        }));
        break;
    }

    return context;
  }

  override async _onRender(_context: any, _options: any) {
    const html = this.element;

    // Wire up tab navigation
    html.querySelectorAll('.sheet-tabs [data-tab]').forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        ev.preventDefault();
        const target = ev.currentTarget as HTMLElement;
        const tab = target.dataset.tab;
        if (tab) this.changeTab(tab, "primary");
      });
    });

    // Only allow editing for owners
    if (!this.isEditable) return;

    // Delete owned item
    html.querySelectorAll(".item-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest(".item") as HTMLElement;
        const itemId = li?.dataset.itemId;
        if (itemId) this.document.deleteEmbeddedDocuments("Item", [itemId]);
      });
    });

    // Edit owned item
    html.querySelectorAll(".item-edit").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest(".item") as HTMLElement;
        const itemId = li?.dataset.itemId;
        if (itemId) {
          const item = this.document.items.get(itemId);
          item?.sheet?.render(true);
        }
      });
    });
  }
}

/**
 * Sheet for ODD RPG Items.
 */
export class OddItemSheet extends (HandlebarsApplicationMixin(ItemSheetV2) as typeof ItemSheetV2) {
  static override DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "item"],
    position: {
      width: 480,
      height: 400,
    },
  };

  static override PARTS = {
    sheet: {
      template: "systems/odd-rpg/templates/item/item-sheet.hbs",
    },
  };

  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const item = this.document;

    return {
      ...context,
      item,
      system: item.system,
    };
  }
}
