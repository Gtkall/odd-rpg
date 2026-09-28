/**
 * ODDEasy character sheet: one page, following the ODDEasy character sheet
 * (p. 34). Everything it rolls goes through the engine in OddActorSheetBase.
 */

import { ATTRIBUTE_DICE_TYPES, EASY_ATTRIBUTES, EASY_ATTRIBUTE_LAYOUT } from "../config/attributes.js";
import { EASY_SKILLS } from "../config/skills.js";
import { DICE_TYPES } from "../config/dice.js";
import { EASY_SHOCK_ROLL } from "../config/rolls.js";
import { EASY_STRAIN_VALUES, STRAIN_FATIGUE_PENALTIES } from "../config/strain.js";
import { INJURY_SEVERITIES, INJURY_WOUNDED_PENALTY, type InjurySeverity } from "../config/wounds.js";
import { EasyCharacterDataModel } from "../data/actor/easyCharacter.js";
import { isItemType } from "../utils/item-type.js";
import { updateByPath } from "../utils/update.js";
import { OddActorSheetBase } from "./actor-base.js";

export class OddEasyActorSheet extends OddActorSheetBase {
  static override readonly DEFAULT_OPTIONS = {
    classes: ["odd-rpg", "sheet", "actor", "easy-character"],
    position: {
      width: Math.round(Math.min(window.innerWidth * 0.5, 820)),
      height: Math.round(Math.min(window.innerHeight * 0.85, 1000)),
    },
  };

  static override readonly PARTS = {
    header: {
      template: "systems/odd-rpg/templates/actor/character-header.hbs",
    },
    main: {
      template: "systems/odd-rpg/templates/actor/easy/easy-main.hbs",
      scrollable: [".easy-main"],
    },
  };

  override async _prepareContext(options: unknown) {
    const context = await super._prepareContext(options);
    const system = this.easySystem;
    const rollData = this.document.getRollData();
    const enrich = (html: string) => foundry.applications.ux.TextEditor.enrichHTML(html || "", { rollData });
    const items = [...this.document.items].sort((a, b) => a.sort - b.sort);

    const dieTraits = async (type: "easyTalent" | "easyFlaw") => Promise.all(
      items.filter((i) => isItemType(i, type)).map(async (item) => ({
        id: item.id,
        name: item.name,
        die: item.system.die,
        enrichedDescription: await enrich(item.system.description),
      })),
    );

    const injuries = await Promise.all(
      items.filter((i) => isItemType(i, "injury")).map(async (item) => {
        // The stored value comes from the field's config-derived choices.
        const severity = item.system.severity as InjurySeverity;
        return {
          id: item.id,
          name: item.name,
          severity,
          severityLabel: INJURY_SEVERITIES[severity],
          isWounded: severity === "wounded",
          enrichedDescription: await enrich(item.system.description),
        };
      }),
    );

    const armor = items.filter((i) => isItemType(i, "easyArmor")).map((item) => ({
      id: item.id,
      name: item.name,
      bulk: item.system.bulk,
      protection: item.system.protection,
      equipped: item.system.equipped,
    }));

    // Worn armor's Bulk fills the leftmost slots; each stored slot shifts right by that many
    const { bulkSlots } = system;
    const storedCount = system.strain.slots.length;

    return {
      ...context,
      attributeConfig: EASY_ATTRIBUTES,
      attributeDiceTypes: ATTRIBUTE_DICE_TYPES,
      attributeLayout: EASY_ATTRIBUTE_LAYOUT.map(([left, right]) => ({ left, right })),
      diceTypes: DICE_TYPES,
      skills: Object.entries(EASY_SKILLS).map(([key, label]) => ({ key, label, die: system.skills[key] ?? "" })),
      shockRoll: context.dedicatedRolls[EASY_SHOCK_ROLL.key],
      strainValues: EASY_STRAIN_VALUES,
      strainSlots: system.strainSlotValues.map((value, index) => ({
        index: index - bulkSlots,
        value,
        isBulk: index < bulkSlots,
        label: String(index + 1),
        fatiguePenalty: STRAIN_FATIGUE_PENALTIES[index] ?? null,
      })),
      // Stored slots pushed past the end by Bulk, kept in the form so a save doesn't drop them
      hiddenStrainSlots: system.strain.slots.slice(storedCount - bulkSlots)
        .map((value, i) => ({ index: storedCount - bulkSlots + i, value })),
      strainPenalty: system.strainPenalty,
      isStrainFull: system.isStrainFull,
      traitGroups: [
        {
          title: "ODD.Easy.talents",
          itemType: "easyTalent",
          addPlaceholder: "ODD.Easy.addTalent",
          poolHint: "ODD.Easy.addBonusHint",
          isPenalty: false,
          entries: await dieTraits("easyTalent"),
        },
        {
          title: "ODD.Easy.flaws",
          itemType: "easyFlaw",
          addPlaceholder: "ODD.Easy.addFlaw",
          poolHint: "ODD.Easy.addPenaltyHint",
          isPenalty: true,
          entries: await dieTraits("easyFlaw"),
        },
      ],
      injuries,
      armor,
      woundPenalty: INJURY_WOUNDED_PENALTY,
      enrichedBiography: await enrich(system.biography),
    };
  }

  override async _onRender(context: unknown, options: unknown): Promise<void> {
    await super._onRender(context, options);
    if (!this.isEditable) return;

    this.element.querySelectorAll<HTMLInputElement>(".item-equipped[data-item-id]").forEach((el) => {
      el.addEventListener("change", () => {
        const item = this.document.items.get(el.dataset.itemId!);
        if (item) void updateByPath(item, { "system.equipped": el.checked });
      });
    });
  }

  private get easySystem(): EasyCharacterDataModel {
    const { system } = this.document;
    if (!(system instanceof EasyCharacterDataModel)) throw new Error("OddEasyActorSheet only renders ODDEasy characters");
    return system;
  }
}
