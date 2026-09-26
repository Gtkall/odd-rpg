import { WEAPON_TYPES, WEAPON_HANDS, WEAPON_DISTANCE, WEAPON_TAGS } from "../config/weapon.js";
import { ARMOR_LOCATIONS } from "../config/armor.js";
import { DICE_TYPES } from "../config/dice.js";
import { TALENT_TYPES, TALENT_RANKS, TALENT_CATEGORIES } from "../config/talent.js";
import { FLAW_SEVERITIES, FLAW_CATEGORIES } from "../config/flaw.js";
import { isItemType } from "../utils/item-type.js";
import { updateByPath } from "../utils/update.js";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

// HandlebarsApplicationMixin returns an opaque type; cast once here so class
// declarations stay readable and type inference flows correctly throughout.
const OddItemSheetBase = HandlebarsApplicationMixin(ItemSheetV2) as typeof ItemSheetV2;

export class OddItemSheet extends OddItemSheetBase {

  /** Whether the sheet is currently in edit mode. */
  #isEditMode = false;

  static override readonly DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "item"],
    position: {
      width:  Math.round(Math.min(window.innerWidth  * 0.385, 645)),
      height: Math.round(Math.min(window.innerHeight * 0.595, 755)),
    },
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

    const weaponContext = isItemType(item, "weapon")
      ? {
          weaponTypes:    WEAPON_TYPES,
          weaponHands:    WEAPON_HANDS,
          weaponDistance: WEAPON_DISTANCE,
          weaponTags:     WEAPON_TAGS,
          diceTypes:      DICE_TYPES,
          showOneHanded:  item.system.hands !== "2h",
          showTwoHanded:  item.system.hands !== "1h",
          showBoth:       item.system.hands === "versatile",
          distanceLabel:  item.system.weaponType === "melee"
            ? "ODD.Weapon.Reach"
            : "ODD.Weapon.Range",
        }
      : {};

    const armorContext = isItemType(item, "armor")
      ? (() => {
          const locationActive: Record<string, boolean> = {};
          for (const key of Object.keys(ARMOR_LOCATIONS)) {
            locationActive[key] = item.system.location.includes(key);
          }
          return {
            armorLocations:    ARMOR_LOCATIONS,
            locationActive,
            locationAllActive: Object.values(locationActive).every(Boolean),
          };
        })()
      : {};

    const isEditMode = this.#isEditMode;
    const rollData: Record<string, unknown> = item.actor?.getRollData() ?? {};
    const enrichedDescription = isEditMode
      ? ""
      : await foundry.applications.ux.TextEditor.enrichHTML(
          item.system.description || "",
          { rollData },
        );

    const talentContext = isItemType(item, "talent")
      ? await this._prepareTalentContext(item, isEditMode, rollData)
      : {};

    const flawContext = isItemType(item, "flaw")
      ? {
          flawSeverities: FLAW_SEVERITIES,
          flawCategories: FLAW_CATEGORIES,
        }
      : {};

    return {
      ...context,
      item,
      system: item.system,
      isEditMode,
      enrichedDescription,
      ...weaponContext,
      ...armorContext,
      ...talentContext,
      ...flawContext,
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
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img ?? undefined,
          callback: (path: string) => {
            void this.document.update({ img: path });
          },
        });
        void fp.browse();
      });

    const item = this.document;
    if (isItemType(item, "weapon")) this._onRenderNotes(item);
    if (isItemType(item, "armor"))  this._onRenderArmor(item);
    if (isItemType(item, "talent")) this._onRenderTalent(item);
    if (isItemType(item, "item"))   this._onRenderNotes(item);
  }

  private async _prepareTalentContext(
    item: Item.OfType<"talent">, isEditMode: boolean, rollData: Record<string, unknown> = {},
  ) {
    const system = item.system;
    const isSide = system.talentType === "minorSide" || system.talentType === "majorSide";

    // Build existing tree names for datalist + auto-derive logic
    const collection: Iterable<Item.Implementation> = item.actor ? item.actor.items.values() : game.items.values();
    const existingTrees: string[] = [];
    for (const candidate of collection) {
      if (isItemType(candidate, "talent") && candidate.id !== item.id) {
        const tree = candidate.system.treeName;
        if (tree && !existingTrees.includes(tree)) existingTrees.push(tree);
      }
    }
    existingTrees.sort((a, b) => a.localeCompare(b));

    // Enrich effect bodies in view mode; keep raw HTML for edit mode
    const enrichedEffects = isEditMode
      ? system.effects.map((e) => ({ title: e.title, body: e.body }))
      : await Promise.all(
          system.effects.map(async (e) => ({
            title: e.title,
            body:  await foundry.applications.ux.TextEditor.enrichHTML(e.body || "", { rollData }),
          })),
        );

    return {
      talentTypes:      TALENT_TYPES,
      talentRanks:      TALENT_RANKS,
      talentCategories: TALENT_CATEGORIES,
      isSide,
      existingTrees,
      enrichedEffects,
    };
  }

  private _onRenderTalent(item: Item.OfType<"talent">): void {
    const html   = this.element;
    const system = item.system;

    // Tree combo — auto-derive parentId and suggest rank when an existing tree is selected
    const treeInput = html.querySelector<HTMLInputElement>(`input[name="system.treeName"]`);
    if (treeInput) {
      treeInput.addEventListener("change", (ev) => {
        ev.stopPropagation(); // prevent submitOnChange from double-firing
        const treeName = treeInput.value.trim();

        // For Side Talents, just update treeName; no rank/parent logic
        if (system.talentType !== "main") {
          void updateByPath(item, { "system.treeName": treeName, "system.parentId": "" });
          return;
        }

        // Find Main Talents in the same tree (excluding self)
        const collection: Iterable<Item.Implementation> = item.actor ? item.actor.items.values() : game.items.values();
        const rankOrder = ["I", "II", "III"];
        const inTree: { id: string; rankIdx: number }[] = [];
        for (const candidate of collection) {
          if (!isItemType(candidate, "talent") || candidate.id === item.id) continue;
          const cs = candidate.system;
          if (cs.treeName === treeName && cs.talentType === "main") {
            inTree.push({ id: candidate.id!, rankIdx: rankOrder.indexOf(cs.rank) });
          }
        }

        // Highest existing rank → next rank; that talent becomes the parent
        const highestIdx = inTree.reduce((max, t) => t.rankIdx > max ? t.rankIdx : max, -1);
        const nextRankIdx = Math.min(highestIdx + 1, 2);
        const parentId   = inTree.find(t => t.rankIdx === highestIdx)?.id ?? "";

        void updateByPath(item, {
          "system.treeName": treeName,
          "system.parentId": parentId,
          "system.rank":     rankOrder[nextRankIdx],
        });
      });
    }

    // Snapshot current effect values from the DOM (prose-mirror may have unsaved content)
    const snapshotEffects = (): { title: string; body: string }[] =>
      system.effects.map((e, i) => {
        const titleEl = html.querySelector<HTMLInputElement>(`input[name="system.effects.${i}.title"]`);
        const bodyEl  = html.querySelector<Element & { value?: string }>(`prose-mirror[name="system.effects.${i}.body"]`);
        return {
          title: titleEl?.value ?? e.title,
          body:  bodyEl?.value  ?? e.body,
        };
      });

    // Add effect
    html.querySelector<HTMLButtonElement>("[data-add-effect]")
      ?.addEventListener("click", () => {
        const effects = [...snapshotEffects(), { title: "", body: "" }];
        void updateByPath(item, { "system.effects": effects });
      });

    // Remove effect
    html.querySelectorAll<HTMLButtonElement>("[data-remove-effect]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.removeEffect);
          const effects = snapshotEffects().filter((_, i) => i !== idx);
          void updateByPath(item, { "system.effects": effects });
        });
      });
  }

  /** Tag (notes) editing, shared by every item type that carries notes. */
  private _onRenderNotes(item: Item.OfType<"item" | "weapon" | "armor">): void {
    const html = this.element;

    html.querySelector<HTMLInputElement>(".tag-input")
      ?.addEventListener("keydown", (ev: KeyboardEvent) => {
        if (ev.key !== "Enter") return;
        ev.preventDefault();
        const input = ev.currentTarget as HTMLInputElement;
        const tag = input.value.trim();
        if (!tag) return;
        input.value = "";
        const notes = [...item.system.notes, tag];
        void updateByPath(item, { "system.notes": notes });
      });

    html.querySelectorAll<HTMLButtonElement>("[data-remove-tag]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.removeTag!;
          const notes = item.system.notes
            .filter((t) => t !== tag);
          void updateByPath(item, { "system.notes": notes });
        });
      });
  }

  private _onRenderArmor(item: Item.OfType<"armor">): void {
    const html = this.element;
    const allKeys = Object.keys(ARMOR_LOCATIONS);

    html.querySelectorAll<HTMLButtonElement>("[data-location]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const loc = btn.dataset.location!;
          const current = item.system.location;
          let location: string[];
          if (loc === "all") {
            location = current.length === allKeys.length ? [] : [...allKeys];
          } else if (current.includes(loc)) {
            location = current.filter(l => l !== loc);
          } else {
            location = [...current, loc];
          }
          void updateByPath(item, { "system.location": location });
        });
      });

    this._onRenderNotes(item);
  }
}
