/**
 * ODD RPG — System Entry Point
 *
 * Registers all custom Document classes, Data Models, sheets, and
 * system-wide configuration with FoundryVTT.
 */

import { ODD } from "./module/config.js";
import { OddActor, OddItem } from "./module/documents.js";
import { OddActorSheet, OddItemSheet } from "./module/sheets.js";
import {
  CharacterDataModel,
  ItemDataModel,
  FeatureDataModel,
  SpellDataModel,
} from "./module/data-models.js";

/* -------------------------------------------------------------------------- */
/*  Initialization                                                            */
/* -------------------------------------------------------------------------- */

Hooks.once("init", () => {
  console.log("ODD RPG | Initialising the ODD RPG game system");

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

  // ---- Trackable token attributes ----
  (CONFIG as any).Actor.trackableAttributes = {
    character: {
      bar: ["health"],
      value: ["level"],
    },
  };

  // ---- Register sheets ----
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("odd-rpg", OddActorSheet, {
    makeDefault: true,
    label: "ODD.Sheet.Actor",
  });

  console.log("Hello world");
  console.log("Hello world");

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("odd-rpg", OddItemSheet, {
    makeDefault: true,
    label: "ODD.Sheet.Item",
  });
});

/* -------------------------------------------------------------------------- */
/*  Ready hook                                                                */
/* -------------------------------------------------------------------------- */

Hooks.once("ready", () => {
  console.log("ODD RPG | System ready");
});
