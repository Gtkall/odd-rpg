/**
 * ODD RPG — System Entry Point
 *
 * Registers all custom Document classes, Data Models, sheets, and
 * system-wide configuration with FoundryVTT.
 */

import { ODD } from "./module/config.js";
import { OddActor, OddItem } from "./module/documents.js";
import {
  CharacterDataModel,
  ItemDataModel,
  FeatureDataModel,
  SpellDataModel,
  WeaponDataModel,
  ArmorDataModel,
} from "./module/data-models.js";

const loadTemplates = foundry.applications.handlebars.loadTemplates;
const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;

/* -------------------------------------------------------------------------- */
/*  Initialization                                                            */
/* -------------------------------------------------------------------------- */

Hooks.once("init", () => {
  console.warn("ODD RPG | Initialising the ODD RPG game system");

  // ---- Preload Handlebars templates ----
  void loadTemplates([
    // Partials (registered by path so {{> "path"}} works in templates)
    "systems/odd-rpg/templates/actor/partials/table-attributes.hbs",
    "systems/odd-rpg/templates/actor/partials/table-statistics.hbs",
    "systems/odd-rpg/templates/actor/partials/table-skills.hbs",
    "systems/odd-rpg/templates/actor/partials/table-rolls.hbs",
    "systems/odd-rpg/templates/actor/partials/table-strain.hbs",
    // Tabs
    "systems/odd-rpg/templates/actor/dice-pool-tray.hbs",
    "systems/odd-rpg/templates/actor/tabs/character-main.hbs",
    "systems/odd-rpg/templates/actor/tabs/character-combat.hbs",
    "systems/odd-rpg/templates/actor/tabs/character-talents-flaws.hbs",
    "systems/odd-rpg/templates/chat/dice-pool-roll.hbs",
    // Item partials
    "systems/odd-rpg/templates/item/partials/weapon-form.hbs",
    "systems/odd-rpg/templates/item/partials/armor-form.hbs",
  ]);

  // ---- System configuration ----
  (CONFIG as any).ODD = ODD;

  // ---- Custom Document implementations ----
  (CONFIG as any).Actor.documentClass = OddActor;
  (CONFIG as any).Item.documentClass = OddItem;

  // ---- Data Models ----
  CONFIG.Actor.dataModels.character = CharacterDataModel as any;
  CONFIG.Item.dataModels.item = ItemDataModel as any;
  CONFIG.Item.dataModels.feature = FeatureDataModel as any;
  CONFIG.Item.dataModels.spell = SpellDataModel as any;
  CONFIG.Item.dataModels.weapon = WeaponDataModel as any;
  CONFIG.Item.dataModels.armor  = ArmorDataModel as any;

  // ---- Trackable token attributes ----
  (CONFIG as any).Actor.trackableAttributes = {
    character: {
      bar: ["xp", "statistics.magicPoints"],
      value: ["statistics.movementRate", "statistics.composureThreshold", "statistics.healingRate"],
    },
  };

  // ---- Register sheets (discovered from data models) ----
  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
  DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);

  function registerFromModels(
    documentClass: typeof Actor | typeof Item,
    dataModels: Record<string, any>,
  ) {
    const bySheet = new Map<any, string[]>();
    for (const [type, model] of Object.entries(dataModels)) {
      if (model.sheetClass) {
        const types = bySheet.get(model.sheetClass) ?? [];
        types.push(type);
        bySheet.set(model.sheetClass, types);
      }
    }
    for (const [sheetClass, types] of bySheet) {
      DocumentSheetConfig.registerSheet(documentClass, "odd-rpg", sheetClass, {
        types,
        makeDefault: true,
      });
    }
  }

  registerFromModels(Actor, CONFIG.Actor.dataModels as Record<string, any>);
  registerFromModels(Item, CONFIG.Item.dataModels as Record<string, any>);
});

/* -------------------------------------------------------------------------- */
/*  Ready hook                                                                */
/* -------------------------------------------------------------------------- */

Hooks.once("ready", () => {
  console.warn("ODD RPG | System ready");
});
