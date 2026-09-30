/**
 * Type-level configuration for fvtt-types.
 *
 * These declarations must stay in sync with what odd-rpg.ts registers at
 * runtime: a new Actor or Item type needs its data model listed in
 * DataModelConfig as well as its file under src/module/data/.
 */

import type { ODD } from "../module/config/index.js";
import type { RulesetKey } from "../module/config/rulesets.js";
import type { OddActor } from "../module/documents/actor.js";
import type { OddItem } from "../module/documents/item.js";
import type { OddCombat } from "../module/documents/combat.js";
import type { DicePoolCard } from "../module/chat/dice-pool-card.js";
import type { ChallengeState } from "../module/tracker/challenge-tracker.js";
import type CharacterDataModel from "../module/data/actor/character.js";
import type EasyCharacterDataModel from "../module/data/actor/easyCharacter.js";
import type ArmorDataModel from "../module/data/item/armor.js";
import type EasyArmorDataModel from "../module/data/item/easyArmor.js";
import type EasyFlawDataModel from "../module/data/item/easyFlaw.js";
import type EasyTalentDataModel from "../module/data/item/easyTalent.js";
import type EasyWeaponDataModel from "../module/data/item/easyWeapon.js";
import type FeatureDataModel from "../module/data/item/feature.js";
import type FlawDataModel from "../module/data/item/flaw.js";
import type InjuryDataModel from "../module/data/item/injury.js";
import type ItemDataModel from "../module/data/item/item.js";
import type SpellDataModel from "../module/data/item/spell.js";
import type TalentDataModel from "../module/data/item/talent.js";
import type WeaponDataModel from "../module/data/item/weapon.js";

declare module "fvtt-types/configuration" {
  // Every `game` access in this system happens in an init hook or later, and
  // the init-time ones (keybindings, i18n) exist by then, so type `game` as
  // fully initialized.
  interface AssumeHookRan {
    ready: never;
  }

  interface DocumentClassConfig {
    Actor: typeof OddActor;
    Item: typeof OddItem;
    Combat: typeof OddCombat;
  }

  // OddItem is generic over its subtype so that checking `item.type`
  // narrows `item.system` to the matching data model.
  interface ConfiguredItem<SubType extends Item.SubType> {
    document: OddItem<SubType>;
  }

  // odd-rpg declares its document types in system.json, so the "base" subtype
  // never occurs, and its sheets are registered only for its own subtypes.
  // Ignoring both keeps `actor.system` narrowable to our models alone.
  interface SystemConfig {
    Actor: { moduleSubtype: "ignore"; base: "ignore" };
    Item: { moduleSubtype: "ignore"; base: "ignore" };
  }

  interface SettingConfig {
    /** The ruleset whose document types the "Create" dialogs offer. */
    "odd-rpg.ruleset": RulesetKey;
    /** The challenge tracker's Turn, Timer and Goals, shared by every client. */
    "odd-rpg.challenge": ChallengeState;
  }

  interface FlagConfig {
    // Set by the initiative tracker when a combatant is parked in the Waiting column.
    Combatant: {
      "odd-rpg": { waiting: boolean };
    };
    // A dice pool roll's card, kept so Pushing Yourself can re-render it.
    ChatMessage: {
      "odd-rpg": { dicePool: DicePoolCard };
    };
  }

  interface DataModelConfig {
    Actor: {
      character: typeof CharacterDataModel;
      easyCharacter: typeof EasyCharacterDataModel;
    };
    Item: {
      armor: typeof ArmorDataModel;
      easyArmor: typeof EasyArmorDataModel;
      easyFlaw: typeof EasyFlawDataModel;
      easyTalent: typeof EasyTalentDataModel;
      easyWeapon: typeof EasyWeaponDataModel;
      feature: typeof FeatureDataModel;
      flaw: typeof FlawDataModel;
      injury: typeof InjuryDataModel;
      item: typeof ItemDataModel;
      spell: typeof SpellDataModel;
      talent: typeof TalentDataModel;
      weapon: typeof WeaponDataModel;
    };
  }
}

declare global {
  interface CONFIG {
    ODD: typeof ODD;
  }
}
