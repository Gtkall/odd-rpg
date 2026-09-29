/**
 * ODD RPG — System Entry Point
 *
 * Adding a new Actor type:  create src/module/data/actor/<type>.ts (export default)
 *                           and register a sheet for it below (each type has its own)
 * Adding a new Item type:   create src/module/data/item/<type>.ts  (export default)
 *                           and list either in DataModelConfig (src/types/fvtt-config.d.ts)
 * Adding a new template:    drop a .hbs anywhere under templates/
 * Everything else is auto-discovered.
 */

import { ODD } from "./module/config/index.js";
import { OddActor } from "./module/documents/actor.js";
import { OddItem } from "./module/documents/item.js";
import { OddCombat } from "./module/documents/combat.js";
import { OddActorSheet } from "./module/sheets/actor.js";
import { OddEasyActorSheet } from "./module/sheets/easy-actor.js";
import { OddItemSheet } from "./module/sheets/item.js";
import { registerEnrichers } from "./module/enrichers.js";
import { onRenderDicePoolCard } from "./module/chat/dice-pool-card.js";
import { OddInitiativeTracker } from "./module/tracker/initiative-tracker.js";
import { migrations } from "./module/migrations/index.js";
import { registerSettings } from "./module/settings.js";

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
  registerEnrichers();
  registerSettings();
  migrations.register();

  // ---- System configuration ----
  CONFIG.ODD = ODD;

  // ---- Custom Document implementations ----
  CONFIG.Actor.documentClass = OddActor;
  CONFIG.Item.documentClass = OddItem;
  CONFIG.Combat.documentClass = OddCombat;

  // ---- Data Models ----
  // The typed shape of these records comes from DataModelConfig (src/types/fvtt-config.d.ts).
  const byTypeName = (models: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(models).map(([path, model]) => [typeName(path), model]));
  Object.assign(CONFIG.Actor.dataModels, byTypeName(actorModels));
  Object.assign(CONFIG.Item.dataModels, byTypeName(itemModels));

  // ---- Trackable token attributes ----
  // fvtt-types 14.366 beta types this as a single entry, but Foundry keys it by
  // actor type (TokenDocument._getConfiguredTrackedAttributes(type); dnd5e does the same).
  Object.assign(CONFIG.Actor.trackableAttributes, {
    character: {
      bar: ["xp", "statistics.magicPoints"],
      value: ["statistics.movementRate", "statistics.composureThreshold", "statistics.healingRate"],
    },
  });

  // ---- Register sheets ----
  // Core still registers its deprecated V1 sheets as defaults (until v16); removing them is the point.
  // eslint-disable-next-line sonarjs/deprecation
  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
  // eslint-disable-next-line sonarjs/deprecation
  DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);

  DocumentSheetConfig.registerSheet(Actor, "odd-rpg", OddActorSheet, {
    types: ["character"],
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Actor, "odd-rpg", OddEasyActorSheet, {
    types: ["easyCharacter"],
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Item, "odd-rpg", OddItemSheet, {
    types: Object.keys(itemModels).map(typeName) as Item.SubType[],
    makeDefault: true,
  });
});

/* -------------------------------------------------------------------------- */
/*  Ready hook                                                                */
/* -------------------------------------------------------------------------- */

Hooks.once("ready", () => {
  console.warn("ODD RPG | System ready");
  if (game.user.isGM) {
    migrations.run().catch((err: unknown) => { console.error("ODD RPG | World migration failed", err); });
  }
});

/* -------------------------------------------------------------------------- */
/*  Chat — Push Yourself from a dice pool roll's card                         */
/* -------------------------------------------------------------------------- */

Hooks.on("renderChatMessageHTML", onRenderDicePoolCard);

/* -------------------------------------------------------------------------- */
/*  Initiative Tracker — re-render on combat changes                         */
/* -------------------------------------------------------------------------- */

for (const hookName of ["createCombatant", "deleteCombatant", "updateCombatant", "createCombat", "deleteCombat"] as const) {
  Hooks.on(hookName, () => {
    const tracker = OddInitiativeTracker.instance;
    if (tracker.rendered) void tracker.render();
  });
}

/* -------------------------------------------------------------------------- */
/*  Keybinding — open the initiative tracker (registered during init)        */
/* -------------------------------------------------------------------------- */
// Keybindings must be registered in the init hook.
// Default: Shift+I (configurable by the user in Foundry's Configure Controls dialog).
Hooks.once("init", () => {
  game.keybindings.register("odd-rpg", "initiative-tracker", {
    name: "ODD.Tracker.keybindName",
    hint: "ODD.Tracker.keybindHint",
    editable: [{ key: "KeyI", modifiers: [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.SHIFT] }],
    onDown: () => { void OddInitiativeTracker.instance.render({ force: true }); return true; },
  });
});

/* -------------------------------------------------------------------------- */
/*  Scene control button — adds a tracker button to the Token controls bar   */
/* -------------------------------------------------------------------------- */
// In Foundry v13, controls is a Record<string, SceneControl>; tools live inside each control.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
Hooks.on("getSceneControlButtons", (controls: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const tokens = controls.tokens;
  if (!tokens) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  tokens.tools["odd-initiative-tracker"] = {
    name: "odd-initiative-tracker",
    title: "ODD.Tracker.title",
    icon: "fa-solid fa-list-ol",
    order: 9,
    button: true,
    onChange: () => { void OddInitiativeTracker.instance.render({ force: true }); },
  };
});
