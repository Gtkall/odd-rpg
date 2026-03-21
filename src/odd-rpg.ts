/**
 * ODD RPG — System Entry Point
 *
 * Adding a new Actor type:  create src/module/data/actor/<type>.ts (export default)
 * Adding a new Item type:   create src/module/data/item/<type>.ts  (export default)
 * Adding a new template:    drop a .hbs anywhere under templates/
 * Everything else is auto-discovered.
 */

import { ODD } from "./module/config/index.js";
import { OddActor } from "./module/documents/actor.js";
import { OddItem } from "./module/documents/item.js";
import { OddActorSheet } from "./module/sheets/actor.js";
import { OddItemSheet } from "./module/sheets/item.js";

const loadTemplates = foundry.applications.handlebars.loadTemplates;
const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;

// ---- Auto-discover Handlebars templates ----------------------------------------
const templatePaths = Object.keys(
  import.meta.glob("../templates/**/*.hbs"),
).map(p => p.replace("../", "systems/odd-rpg/"));

// ---- Auto-discover data models (file name = Foundry type name) -----------------
const actorModels = import.meta.glob("./module/data/actor/*.ts", { eager: true, import: "default" });
const itemModels = import.meta.glob("./module/data/item/*.ts", { eager: true, import: "default" });

const typeName = (path: string) => path.split("/").pop()!.replace(".ts", "");

/* -------------------------------------------------------------------------- */
/*  Initialization                                                            */
/* -------------------------------------------------------------------------- */

Hooks.once("init", () => {
  console.warn("ODD RPG | Initializing the ODD RPG game system");

  void loadTemplates(templatePaths);

  // ---- System configuration ----
  // CONFIG.ODD is a system-specific extension not in fvtt-types; cast is unavoidable here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (CONFIG as any).ODD = ODD;

  // ---- Custom Document implementations ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (CONFIG as any).Actor.documentClass = OddActor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (CONFIG as any).Item.documentClass = OddItem;

  // ---- Data Models ----
  // model is unknown (glob return); cast to the record's value type to avoid bare `any`.
  type ActorDataModel = (typeof CONFIG.Actor.dataModels)[string];
  type ItemDataModel  = (typeof CONFIG.Item.dataModels)[string];
  for (const [path, model] of Object.entries(actorModels)) {
    CONFIG.Actor.dataModels[typeName(path)] = model as ActorDataModel;
  }
  for (const [path, model] of Object.entries(itemModels)) {
    CONFIG.Item.dataModels[typeName(path)] = model as ItemDataModel;
  }

  // ---- Trackable token attributes ----
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["xp", "statistics.magicPoints"],
      value: ["statistics.movementRate", "statistics.composureThreshold", "statistics.healingRate"],
    },
  };

  // ---- Register sheets ----
  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
  DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);

  DocumentSheetConfig.registerSheet(Actor, "odd-rpg", OddActorSheet, {
    types: Object.keys(actorModels).map(typeName),
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Item, "odd-rpg", OddItemSheet, {
    types: Object.keys(itemModels).map(typeName),
    makeDefault: true,
  });
});

/* -------------------------------------------------------------------------- */
/*  Ready hook                                                                */
/* -------------------------------------------------------------------------- */

Hooks.once("ready", () => {
  console.warn("ODD RPG | System ready");
});
