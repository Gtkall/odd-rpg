import { ATTRIBUTES, ATTRIBUTE_DICE_TYPES, ATTRIBUTE_LAYOUT } from "../config/attributes.js";
import { SKILLS, SKILL_CATEGORIES, SKILL_LAYOUT } from "../config/skills.js";
import { DICE_TYPES } from "../config/dice.js";
import { COMMON_ROLLS, INITIATIVE_ROLL, STAMINA_ROLL } from "../config/rolls.js";
import {
  STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT,
  STRAIN_MAX_FORTITUDE_SLOTS, STRAIN_FATIGUE_PENALTIES,
} from "../config/strain.js";
import type { CharacterSystemData } from "../data/actor/character.js";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

// HandlebarsApplicationMixin returns an opaque type; cast once here so class
// declarations stay readable and type inference flows correctly throughout.
const OddActorSheetBase = HandlebarsApplicationMixin(ActorSheetV2) as typeof ActorSheetV2;

// fvtt-types doesn't fully model these APIs; typed once here to avoid repetition
interface ActorWithRollData { getRollData(): Record<string, unknown> }
interface RollWithReplaceFormulaData { replaceFormulaData(f: string, d: object, o?: { missing?: string }): string }

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

    const attributeLayout = ATTRIBUTE_LAYOUT.map(([left, right]) => ({ left, right }));

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

    const rollModifiers: Record<string, string> = system.rollModifiers;

    const buildRollContext = (roll: (typeof COMMON_ROLLS)[number]) => {
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
        modifier: rollModifiers[roll.key] ?? "",
      };
    };

    const commonRolls = COMMON_ROLLS.map(buildRollContext);
    const initiativeRoll = buildRollContext(INITIATIVE_ROLL);
    const staminaRoll = buildRollContext(STAMINA_ROLL);

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
      initiativeRoll,
      staminaRoll,
      strainSlots,
      strainValues: STRAIN_VALUES,
      strainFortitudeManualOverride: strain.fortitudeManualOverride,
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

  _dicePool: { id: string; label: string; die: string }[] = [];
  _dicePoolFlat = 0;

  override async _onRender(_context: any, _options: any) {
    const html = this.element;

    html.querySelectorAll(".sheet-tabs [data-tab]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        ev.preventDefault();
        const target = ev.currentTarget as HTMLElement;
        const tab = target.dataset.tab;
        if (tab) this.changeTab(tab, "primary");
      });
    });

    if (!html.querySelector(".dice-pool-tray")) {
      const nav = html.querySelector(".sheet-tabs");
      if (nav) {
        const tray = document.createElement("div");
        tray.className = "dice-pool-tray";
        nav.after(tray);
      }
    }
    await this._updateDicePoolTray();

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

    html.querySelectorAll(".roll-action-roll[data-common-roll]").forEach((el) => {
      el.addEventListener("click", () => {
        void this._rollCommonRoll((el as HTMLElement).dataset.commonRoll!);
      });
    });

    html.querySelectorAll(".roll-action-pool[data-common-roll]").forEach((el) => {
      el.addEventListener("click", () => {
        void this._addCommonRollToPool((el as HTMLElement).dataset.commonRoll!);
      });
    });

    if (!this.isEditable) return;

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

    html.querySelectorAll(".item-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const li = (ev.currentTarget as HTMLElement).closest<HTMLElement>(".item")!;
        const itemId = li.dataset.itemId;
        if (itemId) void this.document.deleteEmbeddedDocuments("Item", [itemId]);
      });
    });

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

  async _addToDicePool(label: string, die: string): Promise<void> {
    this._dicePool.push({ id: crypto.randomUUID(), label, die });
    await this._updateDicePoolTray();
  }

  async _removeFromDicePool(id: string): Promise<void> {
    this._dicePool = this._dicePool.filter((e) => e.id !== id);
    await this._updateDicePoolTray();
  }

  async _clearDicePool(): Promise<void> {
    this._dicePool = [];
    this._dicePoolFlat = 0;
    await this._updateDicePoolTray();
  }

  async _updateDicePoolTray(): Promise<void> {
    const tray = this.element.querySelector(".dice-pool-tray");
    if (!tray) return;

    tray.innerHTML = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/actor/dice-pool-tray.hbs",
      { dicePool: this._dicePool, dicePoolFlat: this._dicePoolFlat },
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

  async _rollDicePool(): Promise<void> {
    if (this._dicePool.length === 0) return;
    const flatSign = this._dicePoolFlat > 0 ? "+" : "";
    const bonus = this._dicePoolFlat !== 0 ? `${flatSign}${this._dicePoolFlat}` : undefined;
    await this._executeRoll(this._dicePool, bonus);
    this._dicePool = [];
    this._dicePoolFlat = 0;
    void this._updateDicePoolTray();
  }

  private _resolveCommonRoll(key: string): { entries: { label: string; die: string }[]; bonus: string | undefined } | undefined {
    const def =
      COMMON_ROLLS.find((r) => r.key === key) ??
      (STAMINA_ROLL.key === key ? STAMINA_ROLL : undefined) ??
      (INITIATIVE_ROLL.key === key ? INITIATIVE_ROLL : undefined);
    if (!def) return undefined;
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
      .filter((e) => e.die);
    const bonus = (system.rollModifiers[key] ?? "").trim() || undefined;
    return { entries, bonus };
  }

  async _rollCommonRoll(key: string): Promise<void> {
    const resolved = this._resolveCommonRoll(key);
    if (!resolved) return;
    await this._executeRoll(resolved.entries, resolved.bonus);
  }

  async _addCommonRollToPool(key: string): Promise<void> {
    const resolved = this._resolveCommonRoll(key);
    if (!resolved) return;
    for (const { label, die } of resolved.entries) {
      await this._addToDicePool(label, die);
    }
    if (resolved.bonus) {
      await this._addBonusTermsToPool(this._resolveBonusFormula(resolved.bonus));
    }
  }

  private async _addBonusTermsToPool(resolvedBonus: string): Promise<void> {
    let sign = 1;
    for (const term of new Roll(resolvedBonus).terms) {
      if (term instanceof foundry.dice.terms.OperatorTerm) {
        const { operator } = term as unknown as { operator: string };
        sign = operator === "-" ? -1 : 1;
      } else if (term instanceof foundry.dice.terms.DiceTerm) {
        const { number, faces } = term as unknown as { number: number | undefined; faces: number };
        const count = number ?? 1;
        const prefix = sign < 0 ? "-" : "";
        for (let i = 0; i < count; i++) await this._addToDicePool("Bonus", `${prefix}d${faces}`);
        sign = 1;
      } else if (term instanceof foundry.dice.terms.NumericTerm) {
        const { number } = term as unknown as { number: number };
        this._dicePoolFlat += sign * number;
        await this._updateDicePoolTray();
        sign = 1;
      }
    }
  }

  private _resolveBonusFormula(bonus: string): string {
    const rollData = (this.document as unknown as ActorWithRollData).getRollData();
    const cleaned = bonus.replace(/^\+/, "").trim();
    return (Roll as unknown as RollWithReplaceFormulaData).replaceFormulaData(cleaned, rollData, { missing: "0" });
  }

  private async _executeRoll(entries: { label: string; die: string }[], bonus?: string): Promise<void> {
    if (entries.length === 0) return;

    const parts = entries.map((e) => e.die);
    if (bonus) {
      parts.push(this._resolveBonusFormula(bonus));
    }

    const formula = parts.join("+");
    const roll = new Roll(formula);
    await roll.evaluate();

    const breakdown: { label: string; die: string; result: number | string }[] =
      entries.map(({ label, die }, i) => ({
        label,
        die,
        result: roll.dice[i]?.total ?? "?",
      }));

    // Bonus dice sit in roll.dice beyond the source entries; expand NdX into N rows
    for (const term of roll.dice.slice(entries.length)) {
      const dieLabel = `d${term.faces}`;
      const results = term.results as { result: number }[];
      for (const { result } of results) {
        breakdown.push({ label: "Bonus", die: dieLabel, result });
      }
    }

    const diceCount = breakdown.length;
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/chat/dice-pool-roll.hbs",
      {
        total: roll.total,
        formula,
        diceCount,
        diceWord: diceCount === 1 ? "die" : "dice",
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
