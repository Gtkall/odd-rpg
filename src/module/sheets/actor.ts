import { ATTRIBUTES, ATTRIBUTE_DICE_TYPES, ATTRIBUTE_LAYOUT } from "../config/attributes.js";
import { SKILLS, SKILL_CATEGORIES, SKILL_LAYOUT } from "../config/skills.js";
import { DICE_TYPES } from "../config/dice.js";
import { COMMON_ROLLS, INITIATIVE_ROLL, STAMINA_ROLL } from "../config/rolls.js";
import type { RollResolution } from "../config/rolls.js";
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
  /** Whether the sheet is currently in edit mode. */
  #isEditMode = false;
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

    const customSkillsByCategory = new Map<string, typeof system.customSkills>();
    for (const cs of system.customSkills) {
      const arr = customSkillsByCategory.get(cs.category) ?? [];
      arr.push(cs);
      customSkillsByCategory.set(cs.category, arr);
    }

    const skillLayout = SKILL_LAYOUT.map((row) =>
      row.map((catKey) => ({
        key: catKey,
        label: SKILL_CATEGORIES[catKey],
        skills: Object.entries(SKILLS[catKey]).map(([skillKey, labelKey]) => ({
          key: skillKey,
          category: catKey,
          label: labelKey,
        })),
        customSkills: (customSkillsByCategory.get(catKey) ?? []).map((cs) => ({
          id: cs.id,
          name: cs.name,
          die: cs.die,
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
      const dice = sources.filter((s) => s.die).map((s) => s.die);
      const formula = roll.rollResolution === "keepHighest"
        ? `{${dice.join(",")}}kh1`
        : dice.join("+");
      return {
        key: roll.key,
        label: roll.label,
        formula,
        sourceLabels: sources.map((s) => s.label).join(" + "),
        modifier: rollModifiers[roll.key] ?? "",
      };
    };

    const allRolls = COMMON_ROLLS.map((def) => ({ ...buildRollContext(def), dedicated: def.dedicated }));
    const commonRolls = allRolls.filter((r) => !r.dedicated);
    const initiativeRoll = allRolls.find((r) => r.key === INITIATIVE_ROLL.key);
    const staminaRoll = allRolls.find((r) => r.key === STAMINA_ROLL.key);

    const savedRolls = system.savedRolls.map((r) => ({
      key: r.id,
      label: r.name,
      formula: [
        ...r.dice.map((d) => d.die),
        ...(r.flat !== 0 ? [`${r.flat > 0 ? "+" : ""}${r.flat}`] : []),
      ].join("+"),
      sourceLabels: r.dice.map((d) => `${d.label} (${d.die})`).join(", "),
      modifier: rollModifiers[r.id] ?? "",
      deletable: true,
    }));

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
      isEditMode: this.#isEditMode,
      attributeConfig: ATTRIBUTES,
      attributeDiceTypes: ATTRIBUTE_DICE_TYPES,
      diceTypes: DICE_TYPES,
      skillConfig: SKILLS,
      skillCategoryLabels: SKILL_CATEGORIES,
      attributeLayout,
      skillLayout,
      customSkillCategories: Object.entries(SKILL_CATEGORIES).map(([key, label]) => ({ key, label })),
      commonRolls,
      savedRolls,
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
  _rollHistory: { pool: { id: string; label: string; die: string }[]; flat: number }[] = [];
  _rollHistoryIndex = -1;
  _saveRollName = "";

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

    html.querySelector("[data-actor-edit-toggle]")?.addEventListener("click", () => {
      this.#isEditMode = !this.#isEditMode;
      void this.render();
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

    html.querySelectorAll("[data-roll-custom-skill]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const id = (ev.currentTarget as HTMLElement).dataset.rollCustomSkill!;
        const cs = this.characterSystem.customSkills.find((s) => s.id === id);
        if (cs?.die) void this._addToDicePool(cs.name, cs.die);
      });
    });

    html.querySelectorAll(".custom-skill-die").forEach((el) => {
      el.addEventListener("change", (ev: Event) => {
        const select = ev.currentTarget as HTMLSelectElement;
        const id = select.dataset.customSkillId!;
        const updated = this.characterSystem.customSkills.map((s) =>
          s.id === id ? { ...s, die: select.value } : s,
        );
        void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
          .update({ "system.customSkills": updated });
      });
    });

    html.querySelectorAll(".custom-skill-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const row = (ev.currentTarget as HTMLElement).closest<HTMLElement>(".custom-skill-row")!;
        row.dataset.confirmDelete = "true";
      });
    });

    html.querySelectorAll(".custom-skill-confirm-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const id = (ev.currentTarget as HTMLElement).dataset.customSkillId!;
        const updated = this.characterSystem.customSkills.filter((s) => s.id !== id);
        void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
          .update({ "system.customSkills": updated });
      });
    });

    html.querySelectorAll(".custom-skill-cancel-delete").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const row = (ev.currentTarget as HTMLElement).closest<HTMLElement>(".custom-skill-row")!;
        delete row.dataset.confirmDelete;
      });
    });

    html.querySelector(".add-custom-skill-btn")?.addEventListener("click", () => {
      html.querySelector(".custom-skill-form")?.classList.remove("hidden");
      html.querySelector<HTMLButtonElement>(".add-custom-skill-btn")!.style.display = "none";
      html.querySelector<HTMLInputElement>(".custom-skill-name-input")?.focus();
    });

    html.querySelector(".custom-skill-cancel-btn")?.addEventListener("click", () => {
      html.querySelector(".custom-skill-form")?.classList.add("hidden");
      html.querySelector<HTMLButtonElement>(".add-custom-skill-btn")!.style.display = "";
    });

    html.querySelector(".custom-skill-save-btn")?.addEventListener("click", () => {
      const nameInput = html.querySelector<HTMLInputElement>(".custom-skill-name-input");
      const categorySelect = html.querySelector<HTMLSelectElement>(".custom-skill-category-select");
      const name = nameInput?.value.trim() ?? "";
      if (!name) { nameInput?.focus(); return; }
      const category = categorySelect?.value ?? "combat";
      const entry = { id: crypto.randomUUID(), name, category, die: "" };
      const updated = [...this.characterSystem.customSkills, entry];
      void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
        .update({ "system.customSkills": updated });
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

    html.querySelectorAll(".roll-action-delete[data-delete-roll]").forEach((el) => {
      el.addEventListener("click", () => {
        void this._deleteSavedRoll((el as HTMLElement).dataset.deleteRoll!);
      });
    });

    html.querySelectorAll(".roll-entry .bonus-toggle input[type=checkbox]").forEach((el) => {
      el.addEventListener("change", (ev: Event) => {
        const checkbox = ev.currentTarget as HTMLInputElement;
        if (!checkbox.checked) {
          const key = checkbox.dataset.rollKey!;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fvtt-types stubs don't model system.* dot-paths
          void this.document.update({ [`system.rollModifiers.${key}`]: "" } as any);
        }
      });
    });

    if (!this.isEditable) return;

    // Avatar click → FilePicker
    html.querySelector<HTMLImageElement>("img.profile-img")
      ?.addEventListener("click", () => {
        /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const fp = new (CONFIG as any).ux.FilePicker({
          type: "image",
          current: (this.document as any).img as string,
          callback: (path: string) => {
            void (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
              .update({ img: path });
          },
        });
        fp.browse();
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      });

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
    this._rollHistoryIndex = -1;
    await this._updateDicePoolTray();
  }

  async _updateDicePoolTray(): Promise<void> {
    const tray = this.element.querySelector(".dice-pool-tray");
    if (!tray) return;

    tray.innerHTML = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/actor/dice-pool-tray.hbs",
      {
        dicePool: this._dicePool,
        dicePoolFlat: this._dicePoolFlat,
        bonusDice: ["d4", "d6", "d8", "d10", "d12"],
        historyCanGoUp: this._rollHistoryIndex < this._rollHistory.length - 1,
        historyCanGoDown: this._rollHistoryIndex >= 0,
        saveRollName: this._saveRollName,
      },
    );

    tray.querySelector(".dice-pool-roll-btn")?.addEventListener("click", () => { void this._rollDicePool(); });
    tray.querySelector(".dice-pool-clear-btn")?.addEventListener("click", () => { void this._clearDicePool(); });
    tray.querySelectorAll(".pool-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = (chip as HTMLElement).dataset.id;
        if (id) void this._removeFromDicePool(id);
      });
    });
    tray.querySelectorAll(".dice-pool-add-die").forEach((btn) => {
      btn.addEventListener("click", () => {
        const die = (btn as HTMLElement).dataset.die;
        if (die) void this._addToDicePool("Bonus", die);
      });
    });
    tray.querySelector(".history-up")?.addEventListener("click", () => { this._navigateHistory("up"); });
    tray.querySelector(".history-down")?.addEventListener("click", () => { this._navigateHistory("down"); });
    tray.querySelector<HTMLInputElement>(".save-roll-name")?.addEventListener("input", (ev) => {
      this._saveRollName = (ev.currentTarget as HTMLInputElement).value;
    });
    tray.querySelector(".save-roll-btn")?.addEventListener("click", () => { void this._saveCurrentRoll(); });
  }

  async _rollDicePool(): Promise<void> {
    if (this._dicePool.length === 0) return;
    // Save to history before clearing
    this._rollHistory.unshift({ pool: this._dicePool.map((e) => ({ ...e })), flat: this._dicePoolFlat });
    if (this._rollHistory.length > 25) this._rollHistory.pop();
    this._rollHistoryIndex = -1;
    const flatSign = this._dicePoolFlat > 0 ? "+" : "";
    const bonus = this._dicePoolFlat !== 0 ? `${flatSign}${this._dicePoolFlat}` : undefined;
    await this._executeRoll(this._dicePool, bonus);
    this._dicePool = [];
    this._dicePoolFlat = 0;
    void this._updateDicePoolTray();
  }

  private _navigateHistory(direction: "up" | "down"): void {
    const len = this._rollHistory.length;
    if (len === 0) return;
    if (direction === "up") {
      this._rollHistoryIndex = Math.min(this._rollHistoryIndex + 1, len - 1);
    } else {
      if (this._rollHistoryIndex === -1) return;
      this._rollHistoryIndex = Math.max(this._rollHistoryIndex - 1, -1);
    }
    if (this._rollHistoryIndex >= 0) {
      const entry = this._rollHistory[this._rollHistoryIndex];
      this._dicePool = entry.pool.map((e) => ({ ...e }));
      this._dicePoolFlat = entry.flat;
    } else {
      this._dicePool = [];
      this._dicePoolFlat = 0;
    }
    void this._updateDicePoolTray();
  }

  private async _saveCurrentRoll(): Promise<void> {
    if (this._dicePool.length === 0 && this._dicePoolFlat === 0) return;
    const name = this._saveRollName.trim() || "Saved Roll";
    const entry = {
      id: crypto.randomUUID(),
      name,
      dice: this._dicePool.map(({ label, die }) => ({ label, die })),
      flat: this._dicePoolFlat,
    };
    const current = this.characterSystem.savedRolls;
    await (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
      .update({ "system.savedRolls": [...current, entry] });
    this._saveRollName = "";
  }

  private async _deleteSavedRoll(id: string): Promise<void> {
    const updated = this.characterSystem.savedRolls.filter((r) => r.id !== id);
    await (this.document as unknown as { update(d: Record<string, unknown>): Promise<unknown> })
      .update({ "system.savedRolls": updated });
  }

  private _resolveSavedRoll(key: string): { entries: { label: string; die: string }[]; bonus: string | undefined; resolution: RollResolution } | undefined {
    const saved = this.characterSystem.savedRolls.find((r) => r.id === key);
    if (!saved) return undefined;
    const entries = saved.dice.filter((d) => d.die);
    const flatSign = saved.flat > 0 ? "+" : "";
    const flatBonus = saved.flat !== 0 ? `${flatSign}${saved.flat}` : undefined;
    const modBonus = (this.characterSystem.rollModifiers[key] ?? "").trim() || undefined;
    const bonus = modBonus ?? flatBonus;
    return { entries, bonus, resolution: "sum" };
  }

  private _resolveCommonRoll(key: string): { entries: { label: string; die: string }[]; bonus: string | undefined; resolution: RollResolution } | undefined {
    const def = COMMON_ROLLS.find((r) => r.key === key);
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
    return { entries, bonus, resolution: def.rollResolution ?? "sum" };
  }

  async _rollCommonRoll(key: string): Promise<void> {
    const resolved = this._resolveCommonRoll(key) ?? this._resolveSavedRoll(key);
    if (!resolved) return;
    const total = await this._executeRoll(resolved.entries, resolved.bonus, resolved.resolution);
    if (resolved.resolution === "keepHighest" && total !== undefined) {
      await this._setInitiativeInCombat(total);
    }
  }

  async _addCommonRollToPool(key: string): Promise<void> {
    const resolved = this._resolveCommonRoll(key) ?? this._resolveSavedRoll(key);
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

  private async _executeRoll(
    entries: { label: string; die: string }[],
    bonus?: string,
    resolution: RollResolution = "sum",
  ): Promise<number | undefined> {
    if (entries.length === 0) return undefined;

    const diceParts = entries.map((e) => e.die);
    const roll = new Roll(diceParts.join("+"));
    await roll.evaluate();

    let finalTotal: number;
    let breakdown: { label: string; die: string; result: number | string; discarded?: boolean }[];

    if (resolution === "keepHighest") {
      // Determine max die; mark the rest discarded
      const dieValues = entries.map((_, i) => {
        const r = roll.dice[i]?.results?.[0] as { result: number } | undefined;
        return r?.result ?? 0;
      });
      const maxVal = Math.max(...dieValues);
      const keptIdx = dieValues.indexOf(maxVal);

      let bonusVal = 0;
      if (bonus) {
        const bonusRoll = await new Roll(this._resolveBonusFormula(bonus)).evaluate();
        bonusVal = bonusRoll.total;
      }
      finalTotal = maxVal + bonusVal;
      breakdown = entries.map(({ label, die }, i) => ({
        label, die, result: dieValues[i] ?? "?", discarded: i !== keptIdx,
      }));
    } else {
      if (bonus) {
        const resolved = this._resolveBonusFormula(bonus);
        const bonusRoll = await new Roll(resolved).evaluate();
        finalTotal = roll.total! + bonusRoll.total;
        breakdown = this._buildSumBreakdown(entries, roll);
        // Bonus dice from the bonus roll
        for (const term of bonusRoll.dice) {
          const dieLabel = `d${term.faces}`;
          const results = term.results as { result: number }[];
          for (const { result } of results) breakdown.push({ label: "Bonus", die: dieLabel, result });
        }
      } else {
        finalTotal = roll.total ?? 0;
        breakdown = this._buildSumBreakdown(entries, roll);
      }
    }

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/odd-rpg/templates/chat/dice-pool-roll.hbs",
      { total: finalTotal, breakdown, isKeepHighest: resolution === "keepHighest" },
    );

    await (ChatMessage as any).create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      speaker: (ChatMessage as any).getSpeaker({ actor: this.document }), // eslint-disable-line @typescript-eslint/no-explicit-any
      content,
      rolls: [roll],
    });

    return finalTotal;
  }

  private _buildSumBreakdown(
    entries: { label: string; die: string }[],
    roll: Roll,
  ): { label: string; die: string; result: number | string }[] {
    return entries.map(({ label, die }, i) => ({ label, die, result: roll.dice[i]?.total ?? "?" }));
  }

  private async _setInitiativeInCombat(value: number): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const combat = (game as any).combat;
    if (!combat) return;
    const tokens: { id: string }[] = (this.document as any).getActiveTokens();
    if (tokens.length === 0) return; // no placed token — cannot create/find combatant
    const token = tokens[0];
    const existing = (combat.combatants as any[]).find(
      (c: any) => c.actorId === this.document.id || c.tokenId === token.id,
    );
    const combatant = existing ?? (await combat.createEmbeddedDocuments("Combatant", [{ actorId: this.document.id, tokenId: token.id }]))[0];
    await combatant.update({ initiative: value });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }
}
