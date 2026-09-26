/**
 * Base class for every ODD RPG actor sheet: the shared engine.
 *
 * Tabs, edit mode, scroll preservation, the dice pool tray and its history,
 * common and saved rolls, rolling to chat, the avatar picker, item edit/delete
 * and enricher pool buttons. It reads the actor only through RollingActor, so
 * every character type can reuse it.
 */

import type { CommonRollDef, RollResolution, RollSource } from "../config/rolls.js";
import type { PoolEntry, RollingActor } from "../data/abstract/character-base.js";
import { isDicePoolSource } from "../data/abstract/dice-pool-source.js";
import { updateByPath } from "../utils/update.js";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

// HandlebarsApplicationMixin returns an opaque type; cast once here so class
// declarations stay readable and type inference flows correctly throughout.
const HandlebarsActorSheet = HandlebarsApplicationMixin(ActorSheetV2) as typeof ActorSheetV2;

interface ResolvedRoll {
  entries: PoolEntry[];
  bonus: string | undefined;
  resolution: RollResolution;
}

export abstract class OddActorSheetBase extends HandlebarsActorSheet {
  static override readonly DEFAULT_OPTIONS: foundry.applications.sheets.ActorSheetV2.DefaultOptions = {
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
  };

  static readonly PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {};

  // Our TABS is a {tab, label}[] consumed by _getTabs(); parent expects
  // Record<string, TabsConfiguration> — shapes are incompatible so we use any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override readonly TABS: any = [];

  /** Whether the sheet is currently in edit mode. */
  #isEditMode = false;

  _dicePool: (PoolEntry & { id: string })[] = [];
  _dicePoolFlat = 0;
  _rollHistory: { pool: (PoolEntry & { id: string })[]; flat: number }[] = [];
  _rollHistoryIndex = -1;
  _saveRollName = "";
  _scrollPositions = new Map<string, number>();

  /** The actor's system data, seen through the contract the engine depends on. */
  protected get rollingSystem(): RollingActor {
    return this.document.system;
  }

  _getTabs(): Record<string, any> {
    const tabDefs = (this.constructor as typeof OddActorSheetBase).TABS as { tab: string; label: string }[];
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
    const { rollModifiers } = this.rollingSystem;

    const allRolls = this.rollingSystem.commonRolls.map((def) => ({
      ...this._buildRollContext(def, rollModifiers),
      dedicated: def.dedicated,
    }));

    const savedRolls = this.rollingSystem.savedRolls.map((r) => ({
      key: r.id,
      label: r.name,
      formula: [
        ...r.dice.map((d) => d.die),
        ...((r.flat ?? 0) !== 0 ? [`${(r.flat ?? 0) > 0 ? "+" : ""}${r.flat}`] : []),
      ].join("+"),
      sourceLabels: r.dice.map((d) => `${d.label} (${d.die})`).join(", "),
      modifier: rollModifiers[r.id] ?? "",
      deletable: true,
    }));

    return {
      ...context,
      actor,
      system: actor.system,
      flags: actor.flags,
      isEditMode: this.#isEditMode,
      commonRolls: allRolls.filter((r) => !r.dedicated),
      /** Rolls shown in their own sheet section rather than the Common Rolls panel, by key. */
      dedicatedRolls: Object.fromEntries(allRolls.filter((r) => r.dedicated).map((r) => [r.key, r])),
      savedRolls,
      tabs: this._getTabs(),
    };
  }

  private _buildRollContext(roll: CommonRollDef, rollModifiers: Record<string, string>) {
    const sources = roll.sources.map((src) => this.rollingSystem.resolveRollSource(src));
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
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Foundry API requires async signature
  async _preparePartContext(partId: string, context: any) {
    context.tab = context.tabs[partId];
    return context;
  }

  /** Chat speaker for this sheet's actor. */
  protected _speaker(): ChatMessage.SpeakerData {
    // The v14 types want a stored Actor; a sheet only ever renders a persisted one.
    return ChatMessage.getSpeaker({ actor: this.document as Actor.Stored });
  }

  /** Every scrollable selector declared in PARTS. */
  private get _scrollSelectors(): string[] {
    return Object.values((this.constructor as typeof OddActorSheetBase).PARTS)
      .flatMap((part) => part.scrollable ?? []);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Foundry API requires async signature
  override async _preRender(_context: unknown, _options: unknown): Promise<void> {
    if (!this.rendered) return;
    for (const selector of this._scrollSelectors) {
      const el = this.element.querySelector<HTMLElement>(selector);
      if (el) this._scrollPositions.set(selector, el.scrollTop);
    }
  }

  override async _onRender(_context: any, _options: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await super._onRender(_context, _options);
    const html = this.element;

    for (const [selector, top] of this._scrollPositions) {
      const el = html.querySelector<HTMLElement>(selector);
      if (el) el.scrollTop = top;
    }
    this._scrollPositions.clear();

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
      // Below the tabs, or below the header on a sheet without tabs.
      const anchor = html.querySelector(".sheet-tabs") ?? html.querySelector(".sheet-header");
      if (anchor) {
        const tray = document.createElement("div");
        tray.className = "dice-pool-tray";
        anchor.after(tray);
      }
    }
    await this._updateDicePoolTray();

    html.querySelectorAll("[data-roll-attribute]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const key = (ev.currentTarget as HTMLElement).dataset.rollAttribute!;
        const { label, die } = this.rollingSystem.resolveRollSource({ type: "attribute", key });
        if (die) void this._addToDicePool(label, die);
      });
    });

    html.querySelectorAll("[data-roll-skill]").forEach((el) => {
      el.addEventListener("click", (ev: Event) => {
        const target = ev.currentTarget as HTMLElement;
        const category = target.dataset.rollCategory;
        const key = target.dataset.rollSkill!;
        const source: RollSource = category ? { type: "skill", category, key } : { type: "skill", key };
        const { label, die } = this.rollingSystem.resolveRollSource(source);
        if (die) void this._addToDicePool(label, die);
      });
    });

    // Items whose data model is a DicePoolSource (talents, flaws, injuries…)
    html.querySelectorAll<HTMLElement>("[data-pool-item]").forEach((el) => {
      el.addEventListener("click", () => {
        const system = this.document.items.get(el.dataset.poolItem!)?.system;
        const entry = system && isDicePoolSource(system) ? system.toPoolEntry() : null;
        if (entry) void this._addToDicePool(entry.label, entry.die);
      });
    });

    // A literal die shown on the sheet, e.g. the current Strain Penalty
    html.querySelectorAll<HTMLElement>("[data-pool-die]").forEach((el) => {
      el.addEventListener("click", () => {
        void this._addToDicePool(el.dataset.poolLabel ?? "Bonus", el.dataset.poolDie!);
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
          void updateByPath(this.document, { [`system.rollModifiers.${key}`]: "" });
        }
      });
    });

    if (!this.isEditable) return;

    // Avatar click → FilePicker
    html.querySelector<HTMLImageElement>("img.profile-img")
      ?.addEventListener("click", () => {
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img ?? undefined,
          callback: (path: string) => {
            void this.document.update({ img: path });
          },
        });
        void fp.browse();
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

    // Inline add row
    html.querySelectorAll<HTMLInputElement>(".inventory-add-input[data-item-type]").forEach((el) => {
      el.addEventListener("keydown", (ev: Event) => {
        const ke = ev as KeyboardEvent;
        if (ke.key !== "Enter") return;
        const name = el.value.trim();
        if (!name) return;
        // data-item-type is rendered from the item subtypes this sheet lists.
        void this.document.createEmbeddedDocuments("Item", [{ name, type: el.dataset.itemType as Item.SubType }]);
        el.value = "";
      });
    });

    // Enricher pool buttons ([[/oddPool]] and [[/oddPenalty]] in talent/flaw effect text)
    html.querySelectorAll<HTMLElement>(".odd-pool-btn[data-action]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const link = btn.closest<HTMLElement>(".odd-pool-link");
        if (!link) return;
        const storedDie = link.dataset.die!;
        const label = link.dataset.label ?? "Bonus";
        const action = btn.dataset.action!;

        if (action === "roll") {
          const dieToRoll = storedDie.startsWith("-") ? storedDie.slice(1) : storedDie;
          void (async () => {
            const r = await new Roll(dieToRoll).evaluate();
            await ChatMessage.create({
              speaker: this._speaker(),
              flavor: label,
              rolls: [r],
            });
          })();
        } else if (action === "add-generic") {
          const poolLabel = storedDie.startsWith("-") ? "Penalty" : "Bonus";
          void this._addToDicePool(poolLabel, storedDie);
        } else if (action === "add-named") {
          void this._addToDicePool(label, storedDie);
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
    const current = this.rollingSystem.savedRolls;
    await updateByPath(this.document, { "system.savedRolls": [...current, entry] });
    this._saveRollName = "";
  }

  private async _deleteSavedRoll(id: string): Promise<void> {
    const updated = this.rollingSystem.savedRolls.filter((r) => r.id !== id);
    await updateByPath(this.document, { "system.savedRolls": updated });
  }

  private _resolveSavedRoll(key: string): ResolvedRoll | undefined {
    const saved = this.rollingSystem.savedRolls.find((r) => r.id === key);
    if (!saved) return undefined;
    const entries = saved.dice.filter((d) => d.die);
    const flat = saved.flat ?? 0;
    const flatSign = flat > 0 ? "+" : "";
    const flatBonus = flat !== 0 ? `${flatSign}${flat}` : undefined;
    const modBonus = (this.rollingSystem.rollModifiers[key] ?? "").trim() || undefined;
    const bonus = modBonus ?? flatBonus;
    return { entries, bonus, resolution: "sum" };
  }

  private _resolveCommonRoll(key: string): ResolvedRoll | undefined {
    const def = this.rollingSystem.commonRolls.find((r) => r.key === key);
    if (!def) return undefined;
    const entries = def.sources
      .map((src) => this.rollingSystem.resolveRollSource(src))
      .filter((e) => e.die);
    const bonus = (this.rollingSystem.rollModifiers[key] ?? "").trim() || undefined;
    return { entries, bonus, resolution: def.rollResolution ?? "sum" };
  }

  async _rollCommonRoll(key: string): Promise<void> {
    const resolved = this._resolveCommonRoll(key) ?? this._resolveSavedRoll(key);
    if (!resolved) return;
    const total = await this._executeRoll(resolved.entries, resolved.bonus, resolved.resolution);
    if (total !== undefined) await this._onCommonRollTotal(resolved.resolution, total);
  }

  /** Called with the total of every common or saved roll made from the sheet. */
  protected _onCommonRollTotal(_resolution: RollResolution, _total: number): Promise<void> {
    return Promise.resolve();
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

  protected async _addBonusTermsToPool(resolvedBonus: string): Promise<void> {
    let sign = 1;
    for (const term of new Roll(resolvedBonus).terms) {
      if (term instanceof foundry.dice.terms.OperatorTerm) {
        const { operator } = term;
        sign = operator === "-" ? -1 : 1;
      } else if (term instanceof foundry.dice.terms.DiceTerm) {
        const { number, faces } = term;
        const count = number ?? 1;
        const prefix = sign < 0 ? "-" : "";
        for (let i = 0; i < count; i++) await this._addToDicePool("Bonus", `${prefix}d${faces}`);
        sign = 1;
      } else if (term instanceof foundry.dice.terms.NumericTerm) {
        const { number } = term;
        this._dicePoolFlat += sign * number;
        await this._updateDicePoolTray();
        sign = 1;
      }
    }
  }

  protected _resolveBonusFormula(bonus: string): string {
    const rollData = this.document.getRollData();
    const cleaned = bonus.replace(/^\+/, "").trim();
    return Roll.replaceFormulaData(cleaned, rollData, { missing: "0" });
  }

  protected async _executeRoll(
    entries: PoolEntry[],
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

    await ChatMessage.create({
      speaker: this._speaker(),
      content,
      rolls: [roll],
    });

    return finalTotal;
  }

  private _buildSumBreakdown(
    entries: PoolEntry[],
    roll: Roll,
  ): { label: string; die: string; result: number | string }[] {
    return entries.map(({ label, die }, i) => ({ label, die, result: roll.dice[i]?.total ?? "?" }));
  }
}
