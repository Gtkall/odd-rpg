/**
 * ODD RPG — System Entry Point
 *
 * Adding a new Actor type:  create src/module/data/actor/<type>.ts (export default)
 * Adding a new Item type:   create src/module/data/item/<type>.ts  (export default)
 * Adding a new template:    drop a .hbs anywhere under templates/
 * Everything else is auto-discovered.
 */

import { ODD } from "./module/config.js";
import { OddActor, OddItem } from "./module/documents.js";
import { OddActorSheet, OddItemSheet } from "./module/sheets.js";

const loadTemplates = foundry.applications.handlebars.loadTemplates;
const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;

// ---- Auto-discover Handlebars templates ----------------------------------------
const templatePaths = Object.keys(
  import.meta.glob("../templates/**/*.hbs"),
).map(p => p.replace("../", "systems/odd-rpg/"));

// ---- Auto-discover data models (file name = Foundry type name) -----------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataModelCtor = abstract new (...args: any[]) => any;

const actorModels = import.meta.glob<DataModelCtor>(
  "./module/data/actor/*.ts",
  { eager: true, import: "default" },
);
const itemModels = import.meta.glob<DataModelCtor>(
  "./module/data/item/*.ts",
  { eager: true, import: "default" },
);

const typeName = (path: string) => path.split("/").pop()!.replace(".ts", "");

/* -------------------------------------------------------------------------- */
/*  Initialization                                                            */
/* -------------------------------------------------------------------------- */

Hooks.once("init", () => {
  console.warn("ODD RPG | Initializing the ODD RPG game system");

  void loadTemplates(templatePaths);

  // ---- System configuration ----
  (CONFIG as any).ODD = ODD;

  // ---- Custom Document implementations ----
  (CONFIG as any).Actor.documentClass = OddActor;
  (CONFIG as any).Item.documentClass = OddItem;

  // ---- Data Models ----
  for (const [path, model] of Object.entries(actorModels)) {
    CONFIG.Actor.dataModels[typeName(path)] = model as any;
  }
  for (const [path, model] of Object.entries(itemModels)) {
    CONFIG.Item.dataModels[typeName(path)] = model as any;
  }

  // ---- Trackable token attributes ----
  (CONFIG as any).Actor.trackableAttributes = {
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
