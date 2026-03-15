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
import type { CharacterSystemData } from "./data-models";

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

  private get characterSystem(): CharacterSystemData {
    return this.document.system as unknown as CharacterSystemData;
  }

  /** Accumulated dice pool entries waiting to be rolled. */
  _dicePool: Array<{ id: string; label: string; die: string }> = [];

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

    // Inject dice pool tray after the nav (once per sheet lifetime)
    if (!html.querySelector(".dice-pool-tray")) {
      const nav = html.querySelector(".sheet-tabs");
      if (nav) {
        const tray = document.createElement("div");
        tray.className = "dice-pool-tray";
        nav.after(tray);
      }
    }
    await this._updateDicePoolTray();

    // Dice pool: click attribute/skill labels to add dice to the pool
    html.querySelectorAll("[data-roll-attribute]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const key = (ev.currentTarget as HTMLElement).dataset.rollAttribute!;
        const die = this.characterSystem.attributes[key];
        if (die) {
          const label = game.i18n?.localize(ATTRIBUTES[key]) ?? key;
          this._addToDicePool(label, die);
        }
      });
    });

    html.querySelectorAll("[data-roll-skill]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const target = ev.currentTarget as HTMLElement;
        const category = target.dataset.rollCategory!;
        const skill = target.dataset.rollSkill!;
        const die = this.characterSystem.skills[category]?.[skill];
        if (die) {
          const label = game.i18n?.localize(SKILLS[category]?.[skill]) ?? skill;
          this._addToDicePool(label, die);
        }
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
  /** Add a die entry to the pool and refresh the tray. */
  async _addToDicePool(label: string, die: string): Promise<void> {
    this._dicePool.push({ id: crypto.randomUUID(), label, die });
    await this._updateDicePoolTray();
  }

  /** Remove a single entry by id and refresh the tray. */
  async _removeFromDicePool(id: string): Promise<void> {
    this._dicePool = this._dicePool.filter((e) => e.id !== id);
    await this._updateDicePoolTray();
  }

  /** Clear all dice from the pool and refresh the tray. */
  async _clearDicePool(): Promise<void> {
    this._dicePool = [];
    await this._updateDicePoolTray();
  }

  /** Rebuild the tray DOM to reflect the current pool state. */
  async _updateDicePoolTray(): Promise<void> {
    const tray = this.element?.querySelector(".dice-pool-tray");
    if (!tray) return;

    tray.innerHTML = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/actor/dice-pool-tray.hbs",
      { dicePool: this._dicePool },
    );

    tray.querySelector(".dice-pool-roll-btn")?.addEventListener("click", () => this._rollDicePool());
    tray.querySelector(".dice-pool-clear-btn")?.addEventListener("click", () => this._clearDicePool());
    tray.querySelectorAll(".pool-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = (chip as HTMLElement).dataset.id;
        if (id) this._removeFromDicePool(id);
      });
    });
  }

  /** Roll all pooled dice and post a chat message with an expandable breakdown. */
  async _rollDicePool(): Promise<void> {
    if (this._dicePool.length === 0) return;

    const formula = this._dicePool.map((e) => e.die).join("+");
    const roll = new Roll(formula);
    await roll.evaluate();

    const breakdown = this._dicePool.map(({ label, die }, i) => ({
      label,
      die,
      result: roll.dice[i]?.total ?? "?",
    }));

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/chat/dice-pool-roll.hbs",
      {
        total: roll.total,
        formula,
        diceCount: this._dicePool.length,
        diceWord: this._dicePool.length === 1 ? "die" : "dice",
        breakdown,
      },
    );

    await (ChatMessage as any).create({
      speaker: (ChatMessage as any).getSpeaker({ actor: this.document }),
      content,
      rolls: [roll],
    });

    this._dicePool = [];
    this._updateDicePoolTray();
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
