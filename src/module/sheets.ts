/**
 * ODD RPG — Sheet classes
 *
 * ActorSheet and ItemSheet subclasses that render the Handlebars templates
 * and handle user interaction.
 */

import {
  ATTRIBUTES,
  ATTRIBUTE_DICE_TYPES,
  DICE_TYPES,
  SKILLS,
  SKILL_CATEGORIES,
} from "./config";

const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Character sheet for ODD RPG Actors.
 */
export class OddActorSheet extends (HandlebarsApplicationMixin(
  ActorSheetV2,
) as typeof ActorSheetV2) {
  static override DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "actor", "character"],
    position: {
      width: 720,
      height: 720,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
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
    statistics: {
      template: "systems/odd-rpg/templates/actor/tabs/character-statistics.hbs",
      scrollable: [""],
    },
    skills: {
      template: "systems/odd-rpg/templates/actor/tabs/character-skills.hbs",
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

  static TABS = [
    { tab: "attributes", label: "Attributes" },
    { tab: "statistics", label: "Statistics" },
    { tab: "skills", label: "Skills" },
  ];

  override tabGroups = {
    primary: "attributes",
  };

  _getTabs(): Record<string, any> {
    return (this.constructor as typeof OddActorSheet).TABS.reduce(
      (tabs: Record<string, any>, { tab, ...config }) => {
        tabs[tab] = {
          ...config,
          id: tab,
          group: "primary",
          active: this.tabGroups.primary === tab,
          cssClass: this.tabGroups.primary === tab ? "active" : "",
        };
        return tabs;
      },
      {},
    );
  }

  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const actor = this.document;

    // Separate owned items by type for the template
    const items = actor.items.filter((i: any) => i.type === "item");
    const features = actor.items.filter((i: any) => i.type === "feature");
    const spells = actor.items.filter((i: any) => i.type === "spell");

    return {
      ...context,
      actor,
      system: actor.system,
      flags: actor.flags,
      attributeConfig: ATTRIBUTES,
      attributeDiceTypes: ATTRIBUTE_DICE_TYPES,
      diceTypes: DICE_TYPES,
      skillConfig: SKILLS,
      skillCategoryLabels: SKILL_CATEGORIES,
      items,
      features,
      spells,
      tabs: this._getTabs(),
    };
  }

  async _preparePartContext(partId: string, context: any) {
    context.tab = context.tabs[partId];
    return context;
  }

  override async _onRender(_context: any, _options: any) {
    const html = this.element;

    // Wire up tab navigation
    html.querySelectorAll(".sheet-tabs [data-tab]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        ev.preventDefault();
        const target = ev.currentTarget as HTMLElement;
        const tab = target.dataset.tab;
        if (tab) this.changeTab(tab, "primary");
      });
    });

    // Dice pool: click attribute/skill labels to append dice to chat input
    html.querySelectorAll("[data-roll-attribute]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const key = (ev.currentTarget as HTMLElement).dataset.rollAttribute!;
        const die = (this.document.system as any).attributes[key];
        if (die) this._appendDieToChat(die);
      });
    });

    html.querySelectorAll("[data-roll-skill]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const target = ev.currentTarget as HTMLElement;
        const category = target.dataset.rollCategory!;
        const skill = target.dataset.rollSkill!;
        const die = (this.document.system as any).skills[category]?.[skill];
        if (die) this._appendDieToChat(die);
      });
    });

    // Only allow editing for owners
    if (!this.isEditable) return;

    // Delete owned item
    html.querySelectorAll(".item-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest(
          ".item",
        ) as HTMLElement;
        const itemId = li?.dataset.itemId;
        if (itemId) this.document.deleteEmbeddedDocuments("Item", [itemId]);
      });
    });

    // Edit owned item (must be editable)
    html.querySelectorAll(".item-edit").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest(
          ".item",
        ) as HTMLElement;
        const itemId = li?.dataset.itemId;
        if (itemId) {
          const item = this.document.items.get(itemId);
          item?.sheet?.render(true);
        }
      });
    });
  }
  /**
   * Append a die to the chat message input, building a dice pool formula.
   * First click starts "/r d8", subsequent clicks append "+d10", "+d6", etc.
   */
  _appendDieToChat(die: string): void {
    const chatInput = document.querySelector("#chat-message") as HTMLTextAreaElement | null;
    if (!chatInput) return;

    const current = chatInput.value.trim();
    if (current.startsWith("/r ")) {
      chatInput.value = `${current}+${die}`;
    } else if (current === "") {
      chatInput.value = `/r ${die}`;
    } else {
      // There's existing non-roll text; don't clobber it
      chatInput.value = `${current} /r ${die}`;
    }

    chatInput.focus();
  }
}

/**
 * Sheet for ODD RPG Items.
 */
export class OddItemSheet extends (HandlebarsApplicationMixin(
  ItemSheetV2,
) as typeof ItemSheetV2) {
  static override DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "item"],
    position: {
      width: 480,
      height: 400,
    },
    form: {
      submitOnChange: true,
    },
  };

  static PARTS = {
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
