/**
 * The two rulesets a world can play with. The active one (a world setting)
 * decides which actor and item types the "Create" dialogs offer; documents of
 * the other ruleset stay fully usable.
 */

import { EASY_ITEM_TYPES, ODD_ITEM_TYPES } from "./item-types.js";

export interface RulesetDef {
  label: string;
  actorTypes: readonly string[];
  itemTypes: readonly string[];
}

export type RulesetKey = "odd" | "easy";

export const RULESETS: Readonly<Record<RulesetKey, RulesetDef>> = Object.freeze({
  odd:  { label: "ODD.Settings.Rulesets.odd",  actorTypes: ["character"],     itemTypes: ODD_ITEM_TYPES },
  easy: { label: "ODD.Settings.Rulesets.easy", actorTypes: ["easyCharacter"], itemTypes: EASY_ITEM_TYPES },
});

export const DEFAULT_RULESET: RulesetKey = "odd";
