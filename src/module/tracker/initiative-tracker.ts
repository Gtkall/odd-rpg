/**
 * OddInitiativeTracker — Floating singleton ApplicationV2.
 *
 * Renders a vertical initiative track (+10 → −5) with a Waiting column.
 * Backed by Foundry's Combat / Combatant documents for multiplayer sync.
 *
 * Interactions:
 *   - Roll initiative from the character sheet → token auto-attaches to its slot.
 *   - Drag token → slot bar   : sets initiative to that slot, clears waiting flag.
 *   - Drag token → waiting col: sets isWaiting flag (token parks aside).
 *   - Click token             : pans canvas + selects the token.
 *   - Wait button (⏸)        : moves token to waiting column.
 *   - Remove button (✕)       : removes combatant from combat.
 *   - New Round button        : sends a chat alert prompting all to reroll.
 */

const SLOTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5] as const;

const OVEREXTENDED_PENALTY: Partial<Record<number, string>> = {
  [-1]: "−d4",
  [-2]: "−d6",
  [-3]: "−d8",
  [-4]: "−d10",
  [-5]: "−d12",
};

interface TrackerCombatant {
  id: string;
  name: string;
  img: string;
}

interface TrackerSlot {
  value: number;
  cssClass: string;
  combatants: TrackerCombatant[];
  penaltyLabel: string | null;
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// Note: fvtt-types' HandlebarsApplicationMixin generic constraints cause spurious IDE errors on
// _prepareContext (return type) and _onRender (void vs Promise<void>). These are fvtt-types
// limitations — the build succeeds and the runtime behaviour is correct.
export class OddInitiativeTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static override readonly DEFAULT_OPTIONS = {
    id: "odd-initiative-tracker",
    classes: ["odd-initiative-tracker"],
    tag: "div",
    window: {
      title: "ODD.Tracker.title",
      resizable: true,
    },
    position: {
      width: 480,
      height: 640,
    },
  };

  static override readonly PARTS = {
    tracker: {
      template: "systems/odd-rpg/templates/tracker/initiative-tracker.hbs",
    },
  };

  // Private mutable singleton ref — cannot be readonly
  // eslint-disable-next-line sonarjs/public-static-readonly
  static #instance: OddInitiativeTracker | null = null;

  static get instance(): OddInitiativeTracker {
    OddInitiativeTracker.#instance ??= new OddInitiativeTracker();
    return OddInitiativeTracker.#instance;
  }

  // Foundry requires async; all data is synchronous so no await is needed here
  // eslint-disable-next-line @typescript-eslint/require-await
  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    const rawCombatants: any[] = combat?.combatants?.contents ?? [];

    const toCombatantData = (c: any): TrackerCombatant => ({
      id: c.id,
      name: c.name ?? "Unknown",
      img: c.token?.texture?.src ?? c.actor?.img ?? "icons/svg/mystery-man.svg",
    });

    const waitingCombatants: TrackerCombatant[] = rawCombatants
      .filter((c: any) => c.getFlag("odd-rpg", "waiting") === true)
      .map(toCombatantData);

    const activeCombatants: any[] = rawCombatants
      .filter((c: any) => c.getFlag("odd-rpg", "waiting") !== true);

    const slots: TrackerSlot[] = SLOTS.map((value) => {
      const combatants: TrackerCombatant[] = activeCombatants
        .filter((c: any) => c.initiative === value)
        .map(toCombatantData);

      let cssClass: string;
      if (value >= 9)       cssClass = "odd-slot--high";
      else if (value === 0) cssClass = "odd-slot--zero";
      else if (value < 0)   cssClass = "odd-slot--overextended";
      else                  cssClass = "odd-slot--normal";

      return { value, cssClass, combatants, penaltyLabel: OVEREXTENDED_PENALTY[value] ?? null };
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

    return {...context, slots, waitingCombatants, hasCombat: combat !== null };
  }

  override async _onRender(_context: any, _options: any) {
    await super._onRender(_context, _options);
    const html = this.element;

    // ---- New Round ----
    html.querySelector<HTMLButtonElement>(".odd-tracker-new-round")
      ?.addEventListener("click", () => { void this._onNewRound(); });

    // ---- Token click → toggle action overlay; click away to close ----
    const allTokens = html.querySelectorAll<HTMLElement>(".odd-cbt[data-combatant-id]");
    for (const el of allTokens) {
      el.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        const isOpen = el.classList.contains("odd-cbt--open");
        for (const t of allTokens) t.classList.remove("odd-cbt--open");
        if (!isOpen) el.classList.add("odd-cbt--open");
        else this._focusToken(el.dataset.combatantId ?? "");
      });
    }
    html.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest(".odd-cbt")) {
        for (const t of allTokens) t.classList.remove("odd-cbt--open");
      }
    });

    // ---- Tempo spend buttons (−1 / −2 / −3) ----
    for (const btn of html.querySelectorAll<HTMLButtonElement>(".odd-cbt-tempo")) {
      btn.addEventListener("click", () => {
        const delta = parseInt(btn.dataset.delta ?? "-1", 10);
        void this._spendTempo(btn.dataset.combatantId ?? "", delta);
      });
    }

    // ---- Wait button ----
    for (const btn of html.querySelectorAll<HTMLButtonElement>(".odd-cbt-wait")) {
      btn.addEventListener("click", () => { void this._setWaiting(btn.dataset.combatantId ?? "", true); });
    }

    // ---- Remove button ----
    for (const btn of html.querySelectorAll<HTMLButtonElement>(".odd-cbt-remove")) {
      btn.addEventListener("click", () => { void this._onRemove(btn.dataset.combatantId ?? ""); });
    }

    // ---- Drag-and-drop: tokens are draggable ----
    for (const el of html.querySelectorAll<HTMLElement>(".odd-cbt[data-combatant-id]")) {
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/plain", el.dataset.combatantId ?? "");
        const srcImg = el.querySelector<HTMLImageElement>("img.odd-cbt-img");
        if (srcImg && e.dataTransfer) {
          // Use a detached element so the browser doesn't capture the hover overlay
          const ghost = new Image(34, 34);
          ghost.src = srcImg.src;
          ghost.style.cssText = "position:fixed;top:-100px;left:-100px;border-radius:4px;";
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 17, 17);
          requestAnimationFrame(() => ghost.remove());
        }
      });
    }

    // ---- Drop target: slot bars ----
    for (const slot of html.querySelectorAll<HTMLElement>(".odd-slot[data-value]")) {
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("odd-slot--drag-over");
      });
      slot.addEventListener("dragleave", () => {
        slot.classList.remove("odd-slot--drag-over");
      });
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("odd-slot--drag-over");
        const id = e.dataTransfer?.getData("text/plain");
        if (!id) return;
        const value = parseInt(slot.dataset.value ?? "0", 10);
        void this._dropOnSlot(id, value);
      });
    }

    // ---- Drop target: waiting column ----
    const waitingCol = html.querySelector<HTMLElement>(".odd-waiting-col");
    if (waitingCol) {
      waitingCol.addEventListener("dragover", (e) => {
        e.preventDefault();
        waitingCol.classList.add("odd-waiting-col--drag-over");
      });
      waitingCol.addEventListener("dragleave", () => {
        waitingCol.classList.remove("odd-waiting-col--drag-over");
      });
      waitingCol.addEventListener("drop", (e) => {
        e.preventDefault();
        waitingCol.classList.remove("odd-waiting-col--drag-over");
        const id = e.dataTransfer?.getData("text/plain");
        if (!id) return;
        void this._setWaiting(id, true);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private async _spendTempo(combatantId: string, delta: number): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    if (!combat) return;
    const combatant = (combat.combatants as any[]).find((c: any) => c.id === combatantId);
    if (!combatant) return;
    const current = (combatant.initiative as number | null) ?? 0;
    const next = Math.max(-5, current + delta);
    await combatant.update({ initiative: next });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }

  private async _onNewRound(): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call,
       @typescript-eslint/no-unsafe-member-access */
    await (ChatMessage as any).create({
      content: `<strong>⚔ ${game.i18n!.localize("ODD.Tracker.newRound")}</strong><br>${game.i18n!.localize("ODD.Tracker.newRoundPrompt")}`,
      speaker: { alias: game.i18n!.localize("ODD.Tracker.title") },
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call,
       @typescript-eslint/no-unsafe-member-access */
  }

  private _focusToken(combatantId: string): void {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    if (!combat) return;
    const combatant = (combat.combatants as any[]).find((c: any) => c.id === combatantId);
    if (!combatant) return;
    const token = combatant.token;
    if (!token?.object) return;
    token.object.control({ releaseOthers: true });
    void (canvas as any)?.animatePan({ x: token.x as number, y: token.y as number });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }

  private async _dropOnSlot(combatantId: string, ii: number): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    if (!combat) return;
    const combatant = (combat.combatants as any[]).find((c: any) => c.id === combatantId);
    if (!combatant) return;
    await combatant.update({ initiative: ii });
    await combatant.unsetFlag("odd-rpg", "waiting");
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }

  private async _setWaiting(combatantId: string, waiting: boolean): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    if (!combat) return;
    const combatant = (combat.combatants as any[]).find((c: any) => c.id === combatantId);
    if (!combatant) return;
    if (waiting) {
      await combatant.setFlag("odd-rpg", "waiting", true);
    } else {
      await combatant.unsetFlag("odd-rpg", "waiting");
    }
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }

  private async _onRemove(combatantId: string): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    const combat = (game as any).combat;
    if (!combat) return;
    await combat.deleteEmbeddedDocuments("Combatant", [combatantId]);
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
       @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }
}
