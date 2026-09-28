/**
 * Type-level tests for the data models, run by `npm test` (vitest --typecheck).
 *
 * They pin what the sheets rely on: each subtype's `system` resolves to its
 * model, fields keep their declared shapes, and nothing degrades to `any`,
 * `unknown` or `never` (which fvtt-types does silently when a model or a
 * declaration merge stops lining up).
 */

import { describe, expectTypeOf, it } from "vitest";
import type { PoolEntry, RollingActor } from "../module/data/abstract/character-base.js";
import type { DicePoolSource } from "../module/data/abstract/dice-pool-source.js";
import type CharacterDataModel from "../module/data/actor/character.js";
import type EasyCharacterDataModel from "../module/data/actor/easyCharacter.js";
import type ArmorDataModel from "../module/data/item/armor.js";
import type EasyArmorDataModel from "../module/data/item/easyArmor.js";
import type EasyWeaponDataModel from "../module/data/item/easyWeapon.js";
import type EasyFlawDataModel from "../module/data/item/easyFlaw.js";
import type EasyTalentDataModel from "../module/data/item/easyTalent.js";
import type FlawDataModel from "../module/data/item/flaw.js";
import type InjuryDataModel from "../module/data/item/injury.js";
import type ItemDataModel from "../module/data/item/item.js";
import type TalentDataModel from "../module/data/item/talent.js";
import type WeaponDataModel from "../module/data/item/weapon.js";

describe("character", () => {
  type CharacterSystem = Actor.SystemOfType<"character">;

  it("resolves to CharacterDataModel", () => {
    expectTypeOf<CharacterSystem>().toEqualTypeOf<CharacterDataModel>();
  });

  it("satisfies the RollingActor contract the sheet engine uses", () => {
    expectTypeOf<CharacterDataModel>().toExtend<RollingActor>();
    expectTypeOf<CharacterDataModel["resolveRollSource"]>().returns.toEqualTypeOf<PoolEntry>();
  });

  it("keeps the config-keyed shapes declared in CharacterConfigKeyedData", () => {
    expectTypeOf<CharacterSystem["attributes"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<CharacterSystem["skills"]>().toEqualTypeOf<Record<string, Record<string, string>>>();
    expectTypeOf<CharacterSystem["rollModifiers"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<CharacterSystem["wounds"]["head"]>().toEqualTypeOf<{ state: string; subStatus: string }>();
  });

  it("types the fields inherited from OddCharacterDataBase", () => {
    expectTypeOf<CharacterSystem["playerName"]>().toEqualTypeOf<string>();
    expectTypeOf<CharacterSystem["biography"]>().toEqualTypeOf<string>();
    expectTypeOf<CharacterSystem["xp"]["value"]>().not.toBeAny();
    expectTypeOf<CharacterSystem["savedRolls"][number]["dice"][number]>().toExtend<PoolEntry>();
  });

  it("types the ODD-only fields", () => {
    expectTypeOf<CharacterSystem["strain"]["slots"]>().toEqualTypeOf<string[]>();
    expectTypeOf<CharacterSystem["customSkills"][number]["die"]>().toEqualTypeOf<string>();
    expectTypeOf<CharacterSystem["encumbrance"]["level"]>().toEqualTypeOf<string>();
  });
});

describe("easyCharacter", () => {
  type EasySystem = Actor.SystemOfType<"easyCharacter">;

  it("resolves to EasyCharacterDataModel", () => {
    expectTypeOf<EasySystem>().toEqualTypeOf<EasyCharacterDataModel>();
  });

  it("satisfies the RollingActor contract the sheet engine uses", () => {
    expectTypeOf<EasyCharacterDataModel>().toExtend<RollingActor>();
  });

  it("keeps the config-keyed shapes declared in EasyCharacterKeyedData", () => {
    expectTypeOf<EasySystem["attributes"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<EasySystem["skills"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<EasySystem["rollModifiers"]>().toEqualTypeOf<Record<string, string>>();
  });

  it("types the fields inherited from OddCharacterDataBase", () => {
    expectTypeOf<EasySystem["playerName"]>().toEqualTypeOf<string>();
    expectTypeOf<EasySystem["savedRolls"][number]["dice"][number]>().toExtend<PoolEntry>();
  });

  it("types the Easy-only fields", () => {
    expectTypeOf<EasySystem["strain"]["slots"]>().toEqualTypeOf<string[]>();
    expectTypeOf<EasySystem["strainPenalty"]>().toEqualTypeOf<string | null>();
    expectTypeOf<EasySystem["isStrainFull"]>().toEqualTypeOf<boolean>();
    expectTypeOf<EasySystem["bulkSlots"]>().toEqualTypeOf<number>();
    expectTypeOf<EasySystem["strainSlotValues"]>().toEqualTypeOf<string[]>();
  });
});

describe("items", () => {
  it("resolves each subtype to its model", () => {
    expectTypeOf<Item.SystemOfType<"armor">>().toEqualTypeOf<ArmorDataModel>();
    expectTypeOf<Item.SystemOfType<"easyArmor">>().toEqualTypeOf<EasyArmorDataModel>();
    expectTypeOf<Item.SystemOfType<"easyFlaw">>().toEqualTypeOf<EasyFlawDataModel>();
    expectTypeOf<Item.SystemOfType<"easyWeapon">>().toEqualTypeOf<EasyWeaponDataModel>();
    expectTypeOf<Item.SystemOfType<"easyTalent">>().toEqualTypeOf<EasyTalentDataModel>();
    expectTypeOf<Item.SystemOfType<"injury">>().toEqualTypeOf<InjuryDataModel>();
    expectTypeOf<Item.SystemOfType<"flaw">>().toEqualTypeOf<FlawDataModel>();
    expectTypeOf<Item.SystemOfType<"item">>().toEqualTypeOf<ItemDataModel>();
    expectTypeOf<Item.SystemOfType<"talent">>().toEqualTypeOf<TalentDataModel>();
    expectTypeOf<Item.SystemOfType<"weapon">>().toEqualTypeOf<WeaponDataModel>();
  });

  it("gives every item the description from OddItemDataBase", () => {
    expectTypeOf<Item.SystemOfType<"armor">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"easyArmor">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"easyFlaw">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"easyWeapon">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"easyTalent">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"injury">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"feature">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"flaw">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"item">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"spell">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"talent">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"weapon">["description"]>().toEqualTypeOf<string>();
  });

  it("gives ODDEasy talents and flaws a die and a pool entry", () => {
    expectTypeOf<Item.SystemOfType<"easyTalent">["die"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"easyFlaw">["die"]>().toEqualTypeOf<string>();
    expectTypeOf<EasyTalentDataModel>().toExtend<DicePoolSource>();
    expectTypeOf<EasyFlawDataModel>().toExtend<DicePoolSource>();
  });

  it("types an injury's severity and pool entry", () => {
    expectTypeOf<Item.SystemOfType<"injury">["severity"]>().toEqualTypeOf<string>();
    expectTypeOf<InjuryDataModel>().toExtend<DicePoolSource>();
  });

  it("types ODDEasy armor as whole-number Bulk and Protection", () => {
    expectTypeOf<Item.SystemOfType<"easyArmor">["bulk"]>().toEqualTypeOf<number>();
    expectTypeOf<Item.SystemOfType<"easyArmor">["protection"]>().toEqualTypeOf<number>();
    expectTypeOf<Item.SystemOfType<"easyArmor">["equipped"]>().toEqualTypeOf<boolean>();
  });

  it("types an ODDEasy weapon's Power and its parts", () => {
    expectTypeOf<Item.SystemOfType<"easyWeapon">["power"]>().toEqualTypeOf<number>();
    expectTypeOf<Item.SystemOfType<"easyWeapon">["muscle"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Item.SystemOfType<"easyWeapon">["twoHanded"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Item.SystemOfType<"easyWeapon">["traits"]>().toEqualTypeOf<string>();
    expectTypeOf<EasyWeaponDataModel["hitPower"]>().toEqualTypeOf<number>();
  });

  it("types derived data", () => {
    expectTypeOf<Item.SystemOfType<"flaw">["xpValue"]>().toEqualTypeOf<number>();
    expectTypeOf<Item.SystemOfType<"flaw">["symbol"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"talent">["xpCost"]>().toEqualTypeOf<number>();
  });

  it("types nested schema fields", () => {
    expectTypeOf<Item.SystemOfType<"talent">["effects"][number]["body"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"weapon">["oneHanded"]["damage"]["diceCount"]>().not.toBeAny();
    expectTypeOf<Item.SystemOfType<"armor">["location"]>().toEqualTypeOf<string[]>();
  });
});
