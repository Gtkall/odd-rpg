import { WEAPON_TYPES, WEAPON_HANDS, WEAPON_DISTANCE, WEAPON_TAGS } from "../config/weapon.js";
import { ARMOR_LOCATIONS } from "../config/armor.js";
import { DICE_TYPES } from "../config/dice.js";
import type { WeaponSystemData } from "../data/item/weapon.js";
import type { ArmorSystemData } from "../data/item/armor.js";

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
