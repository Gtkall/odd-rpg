/**
 * ODD RPG — Sheet classes
 *
 * ActorSheet and ItemSheet subclasses that render the Handlebars templates
 * and handle user interaction.
 */

import {
  ATTRIBUTES,
  ATTRIBUTE_DICE_TYPES,
  ATTRIBUTE_LAYOUT,
  COMMON_ROLLS,
  DICE_TYPES,
  SKILLS,
  SKILL_CATEGORIES,
  SKILL_LAYOUT,
  STAMINA_ROLL,
  STRAIN_DEFAULT_SLOT_COUNT,
  STRAIN_FATIGUE_PENALTIES,
  STRAIN_MAX_FORTITUDE_SLOTS,
  STRAIN_VALUES,
  WEAPON_TYPES,
  WEAPON_HANDS,
  WEAPON_DISTANCE,
  WEAPON_TAGS,
  ARMOR_LOCATIONS,
} from "./config";
import type { CharacterSystemData, WeaponSystemData, ArmorSystemData } from "./data-models";

const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

// HandlebarsApplicationMixin returns an opaque type; cast once here so class
// declarations stay readable and type inference flows correctly throughout.
const OddActorSheetBase = HandlebarsApplicationMixin(ActorSheetV2) as typeof ActorSheetV2;
const OddItemSheetBase = HandlebarsApplicationMixin(ItemSheetV2) as typeof ItemSheetV2;

/**
 * Character sheet for ODD RPG Actors.
 */
export class OddActorSheet extends OddActorSheetBase {
  static override readonly DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "actor", "character"],
    position: {
      width: Math.round(Math.min(window.innerWidth * 0.55, 920)),
      height: Math.round(Math.min(window.innerHeight * 0.85, 1080)),
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
  };

  static readonly PARTS = {
    header: {
      template: "systems/odd-rpg/templates/actor/character-header.hbs",
    },
    nav: {
      template: "systems/odd-rpg/templates/actor/character-nav.hbs",
    },
    character: {
      template: "systems/odd-rpg/templates/actor/tabs/character-main.hbs",
      scrollable: [".character-main"],
    },
    combat: {
      template: "systems/odd-rpg/templates/actor/tabs/character-combat.hbs",
      scrollable: [".character-combat"],
    },
    talentsFlaws: {
      template: "systems/odd-rpg/templates/actor/tabs/character-talents-flaws.hbs",
      scrollable: [".character-talents-flaws"],
    },
  };

  // Our TABS is a {tab, label}[] consumed by _getTabs(); parent expects
  // Record<string, TabsConfiguration> — shapes are incompatible so we use any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override readonly TABS: any = [
    { tab: "character", label: "ODD.Sheet.Tabs.character" },
    { tab: "combat", label: "ODD.Sheet.Tabs.combat" },
    { tab: "talentsFlaws", label: "ODD.Sheet.Tabs.talentsFlaws" },
  ];

  override tabGroups = {
    primary: "character",
  };

  _getTabs(): Record<string, any> {
    const tabDefs = (this.constructor as typeof OddActorSheet).TABS as { tab: string; label: string }[];
    return tabDefs.reduce(
      (tabs: Record<string, unknown>, { tab, ...config }: { tab: string; label: string }) => {
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
    const system = this.characterSystem;

    // Attribute pairs for the 2-column layout, driven by ATTRIBUTE_LAYOUT config
    const attributeLayout = ATTRIBUTE_LAYOUT.map(([left, right]) => ({ left, right }));

    // Skill rows for the 3-column layout, driven by SKILL_LAYOUT config
    const skillLayout = SKILL_LAYOUT.map((row) =>
      row.map((catKey) => ({
        key: catKey,
        label: SKILL_CATEGORIES[catKey],
        skills: Object.entries(SKILLS[catKey]).map(([skillKey, labelKey]) => ({
          key: skillKey,
          category: catKey,
          label: labelKey,
        })),
      })),
    );

    // Common rolls with computed formulas from current attribute/skill values
    const commonRolls = COMMON_ROLLS.map((roll) => {
      const sources = roll.sources.map((src) => {
        const die =
          src.type === "attribute"
            ? system.attributes[src.key]
            : (system.skills[src.category][src.key] ?? "");
        const labelKey =
          src.type === "attribute"
            ? ATTRIBUTES[src.key]
            : (SKILLS[src.category][src.key] ?? src.key);
        return { die, label: game.i18n!.localize(labelKey) };
      });
      return {
        key: roll.key,
        label: roll.label,
        formula: sources.filter((s) => s.die).map((s) => s.die).join("+"),
        sourceLabels: sources.map((s) => s.label).join(" + "),
      };
    });

    // Strain: always render all 10 slots; locked = Fort slots not yet unlocked by talent.
    const { strain } = system;
    const lockedFortSlots = STRAIN_MAX_FORTITUDE_SLOTS - strain.fortitudeSlots;
    const strainSlots = Array.from(
      { length: STRAIN_MAX_FORTITUDE_SLOTS + STRAIN_DEFAULT_SLOT_COUNT },
      (_, i) => {
        const isFortSlot = i < STRAIN_MAX_FORTITUDE_SLOTS;
        const isLocked = isFortSlot && (
          strain.fortitudeManualOverride
            ? !(strain.fortitudeManualSlots[i] ?? false)
            : i < lockedFortSlots
        );
        const baseIndex  = isFortSlot ? null : i - STRAIN_MAX_FORTITUDE_SLOTS;
        return {
          index: i,
          value: isLocked ? "" : (strain.slots[i] ?? ""),
          isLocked,
          isFortSlot,
          label: isFortSlot
            ? `Fort ${STRAIN_MAX_FORTITUDE_SLOTS - i}`
            : String(baseIndex! + 1),
          fatiguePenalty: baseIndex !== null && baseIndex >= 2
            ? (STRAIN_FATIGUE_PENALTIES[baseIndex] ?? null)
            : null,
        };
      },
    );

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
      attributeLayout,
      skillLayout,
      commonRolls,
      strainSlots,
      strainValues: STRAIN_VALUES,
      strainFortitudeManualOverride: strain.fortitudeManualOverride,
      staminaRollKey: STAMINA_ROLL.key,
      tabs: this._getTabs(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Foundry API requires async signature
  async _preparePartContext(partId: string, context: any) {
    context.tab = context.tabs[partId];
    return context;
  }

  private get characterSystem(): CharacterSystemData {
    return this.document.system as unknown as CharacterSystemData;
  }

  /** Accumulated dice pool entries waiting to be rolled. */
  _dicePool: { id: string; label: string; die: string }[] = [];

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
          const label = game.i18n!.localize(ATTRIBUTES[key]);
          void this._addToDicePool(label, die);
        }
      });
    });

    html.querySelectorAll("[data-roll-skill]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const target = ev.currentTarget as HTMLElement;
        const category = target.dataset.rollCategory!;
        const skill = target.dataset.rollSkill!;
        const die = this.characterSystem.skills[category][skill];
        if (die) {
          const label = game.i18n!.localize(SKILLS[category][skill]);
          void this._addToDicePool(label, die);
        }
      });
    });

    // Common rolls: clicking the roll name immediately rolls all sources
    html.querySelectorAll("[data-common-roll]").forEach((el) => {
      el.addEventListener("click", () => {
        const key = (el as HTMLElement).dataset.commonRoll!;
        void this._rollCommonRoll(key);
      });
    });

    // Only allow editing for owners
    if (!this.isEditable) return;

    // Fortitude manual slot toggle (🔒/🔓 per Fort slot)
    html.querySelectorAll("[data-fort-slot-toggle]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        ev.preventDefault();
        const i = parseInt((ev.currentTarget as HTMLElement).dataset.fortSlotToggle!, 10);
        const current = this.characterSystem.strain.fortitudeManualSlots;
        const updated = [...current];
        updated[i] = !updated[i];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fvtt-types stubs don't model system.* dot-paths
        void this.document.update({ "system.strain.fortitudeManualSlots": updated } as any);
      });
    });

    // Delete owned item
    html.querySelectorAll(".item-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest<HTMLElement>(".item")!;
        const itemId = li.dataset.itemId;
        if (itemId) void this.document.deleteEmbeddedDocuments("Item", [itemId]);
      });
    });

    // Edit owned item (must be editable)
    html.querySelectorAll(".item-edit").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest<HTMLElement>(".item")!;
        const itemId = li.dataset.itemId;
        if (itemId) {
          const item = this.document.items.get(itemId);
          // eslint-disable-next-line sonarjs/deprecation -- fvtt-types stubs don't model v13 render(options) overload
          void item?.sheet?.render(true);
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
    const tray = this.element.querySelector(".dice-pool-tray");
    if (!tray) return;

    tray.innerHTML = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/actor/dice-pool-tray.hbs",
      { dicePool: this._dicePool },
    );

    tray.querySelector(".dice-pool-roll-btn")?.addEventListener("click", () => { void this._rollDicePool(); });
    tray.querySelector(".dice-pool-clear-btn")?.addEventListener("click", () => { void this._clearDicePool(); });
    tray.querySelectorAll(".pool-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = (chip as HTMLElement).dataset.id;
        if (id) void this._removeFromDicePool(id);
      });
    });
  }

  /** Roll all pooled dice and post a chat message with an expandable breakdown. */
  async _rollDicePool(): Promise<void> {
    if (this._dicePool.length === 0) return;
    await this._executeRoll(this._dicePool);
    this._dicePool = [];
    void this._updateDicePoolTray();
  }

  /** Roll a predefined common roll by config key and post to chat. */
  async _rollCommonRoll(key: string): Promise<void> {
    const def = COMMON_ROLLS.find((r) => r.key === key) ?? (STAMINA_ROLL.key === key ? STAMINA_ROLL : undefined);
    if (!def) return;
    const system = this.characterSystem;
    const entries = def.sources
      .map((src) => ({
        label: game.i18n!.localize(
          src.type === "attribute" ? ATTRIBUTES[src.key] : SKILLS[src.category][src.key],
        ),
        die: src.type === "attribute"
          ? system.attributes[src.key]
          : (system.skills[src.category][src.key] ?? ""),
      }))
      .filter((e) => e.die); // skip untrained skills
    await this._executeRoll(entries);
  }

  /** Evaluate a set of labelled dice, post a breakdown chat message. */
  private async _executeRoll(entries: { label: string; die: string }[]): Promise<void> {
    if (entries.length === 0) return;

    const formula = entries.map((e) => e.die).join("+");
    const roll = new Roll(formula);
    await roll.evaluate();

    const breakdown = entries.map(({ label, die }, i) => ({
      label,
      die,
      result: roll.dice[i]?.total ?? "?",
    }));

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/chat/dice-pool-roll.hbs",
      {
        total: roll.total,
        formula,
        diceCount: entries.length,
        diceWord: entries.length === 1 ? "die" : "dice",
        breakdown,
      },
    );

    await (ChatMessage as any).create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      speaker: (ChatMessage as any).getSpeaker({ actor: this.document }), // eslint-disable-line @typescript-eslint/no-explicit-any
      content,
      rolls: [roll],
    });
  }
}

/**
 * Sheet for ODD RPG Items.
 */
export class OddItemSheet extends OddItemSheetBase {

  /** Whether the sheet is currently in edit mode. */
  #isEditMode = false;

  static override readonly DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "item"],
    position: { width: 520, height: 560 },
    form: { submitOnChange: true },
    window: { resizable: true },
  };

  static readonly PARTS = {
    sheet: {
      template: "systems/odd-rpg/templates/item/item-sheet.hbs",
    },
  };

  override async _prepareContext(options: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const context = await super._prepareContext(options);
    const item = this.document;
    const system = item.system as unknown as WeaponSystemData;

    const weaponContext = (item.type as string) === "weapon"
      ? {
          weaponTypes:    WEAPON_TYPES,
          weaponHands:    WEAPON_HANDS,
          weaponDistance: WEAPON_DISTANCE,
          weaponTags:     WEAPON_TAGS,
          diceTypes:      DICE_TYPES,
          showOneHanded:  system.hands !== "2h",
          showTwoHanded:  system.hands !== "1h",
          showBoth:       system.hands === "versatile",
          distanceLabel:  system.weaponType === "melee"
            ? "ODD.Weapon.Reach"
            : "ODD.Weapon.Range",
        }
      : {};

    const armorSystem = item.system as unknown as ArmorSystemData;
    const armorContext = (item.type as string) === "armor"
      ? (() => {
          const locationActive: Record<string, boolean> = {};
          for (const key of Object.keys(ARMOR_LOCATIONS)) {
            locationActive[key] = armorSystem.location.includes(key);
          }
          return {
            armorLocations:    ARMOR_LOCATIONS,
            locationActive,
            locationAllActive: Object.values(locationActive).every(Boolean),
          };
        })()
      : {};

    const isEditMode = this.#isEditMode;
    const enrichedDescription = isEditMode
      ? ""
      : await foundry.applications.ux.TextEditor.enrichHTML(
          ((item.system as Record<string, unknown>).description as string) || "",
        );

    return {
      ...context,
      item,
      system: item.system,
      isEditMode,
      enrichedDescription,
      ...weaponContext,
      ...armorContext,
    };
  }

  override async _onRender(context: any, options: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    await super._onRender(context, options);

    // Edit mode toggle
    this.element.querySelector<HTMLButtonElement>("[data-edit-toggle]")
      ?.addEventListener("click", () => {
        this.#isEditMode = !this.#isEditMode;
        void this.render();
      });

    // Image click → FilePicker
    this.element.querySelector<HTMLImageElement>("img.item-img")
      ?.addEventListener("click", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fp = new (CONFIG as any).ux.FilePicker({
          type: "image",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current: (this.document as any).img as string,
          callback: (path: string) => {
            void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
              .update({ img: path });
          },
        });
        void fp.browse();
      });

    if ((this.document.type as string) === "weapon") this._onRenderWeapon();
    if ((this.document.type as string) === "armor")  this._onRenderArmor();
  }

  private _onRenderWeapon(): void {
    const html = this.element;

    // Add tag on Enter
    html.querySelector<HTMLInputElement>(".tag-input")
      ?.addEventListener("keydown", (ev: KeyboardEvent) => {
        if (ev.key !== "Enter") return;
        ev.preventDefault();
        const input = ev.currentTarget as HTMLInputElement;
        const tag = input.value.trim();
        if (!tag) return;
        input.value = "";
        const notes = [...(this.document.system as unknown as WeaponSystemData).notes, tag];
        void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
          .update({ "system.notes": notes });
      });

    // Remove tag pill
    html.querySelectorAll<HTMLButtonElement>("[data-remove-tag]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.removeTag!;
          const notes = (this.document.system as unknown as WeaponSystemData).notes
            .filter((t) => t !== tag);
          void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
            .update({ "system.notes": notes });
        });
      });
  }

  private _onRenderArmor(): void {
    const html = this.element;
    const doc = this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> };
    const allKeys = Object.keys(ARMOR_LOCATIONS);

    // Location toggle buttons
    html.querySelectorAll<HTMLButtonElement>("[data-location]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const loc = btn.dataset.location!;
          const current = (this.document.system as unknown as ArmorSystemData).location;
          let location: string[];
          if (loc === "all") {
            location = current.length === allKeys.length ? [] : [...allKeys];
          } else if (current.includes(loc)) {
            location = current.filter(l => l !== loc);
          } else {
            location = [...current, loc];
          }
          void doc.update({ "system.location": location });
        });
      });

    // Add tag on Enter
    html.querySelector<HTMLInputElement>(".tag-input")
      ?.addEventListener("keydown", (ev: KeyboardEvent) => {
        if (ev.key !== "Enter") return;
        ev.preventDefault();
        const input = ev.currentTarget as HTMLInputElement;
        const tag = input.value.trim();
        if (!tag) return;
        input.value = "";
        const notes = [...(this.document.system as unknown as ArmorSystemData).notes, tag];
        void doc.update({ "system.notes": notes });
      });

    // Remove tag pill
    html.querySelectorAll<HTMLButtonElement>("[data-remove-tag]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.removeTag!;
          const notes = (this.document.system as unknown as ArmorSystemData).notes
            .filter((t) => t !== tag);
          void doc.update({ "system.notes": notes });
        });
      });
  }
}
