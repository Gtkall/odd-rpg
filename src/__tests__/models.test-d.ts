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
import type CharacterDataModel from "../module/data/actor/character.js";
import type ArmorDataModel from "../module/data/item/armor.js";
import type FlawDataModel from "../module/data/item/flaw.js";
import type ItemDataModel from "../module/data/item/item.js";
import type TalentDataModel from "../module/data/item/talent.js";
import type WeaponDataModel from "../module/data/item/weapon.js";

describe("character", () => {
  type System = Actor.SystemOfType<"character">;

  it("resolves to CharacterDataModel", () => {
    expectTypeOf<System>().toEqualTypeOf<CharacterDataModel>();
  });

  it("satisfies the RollingActor contract the sheet engine uses", () => {
    expectTypeOf<CharacterDataModel>().toExtend<RollingActor>();
    expectTypeOf<CharacterDataModel["resolveRollSource"]>().returns.toEqualTypeOf<PoolEntry>();
  });

  it("keeps the config-keyed shapes declared in CharacterConfigKeyedData", () => {
    expectTypeOf<System["attributes"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<System["skills"]>().toEqualTypeOf<Record<string, Record<string, string>>>();
    expectTypeOf<System["rollModifiers"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<System["wounds"]["head"]>().toEqualTypeOf<{ state: string; subStatus: string }>();
  });

  it("types the fields inherited from OddCharacterDataBase", () => {
    expectTypeOf<System["playerName"]>().toEqualTypeOf<string>();
    expectTypeOf<System["biography"]>().toEqualTypeOf<string>();
    expectTypeOf<System["xp"]["value"]>().not.toBeAny();
    expectTypeOf<System["savedRolls"][number]["dice"][number]>().toExtend<PoolEntry>();
  });

  it("types the ODD-only fields", () => {
    expectTypeOf<System["strain"]["slots"]>().toEqualTypeOf<string[]>();
    expectTypeOf<System["customSkills"][number]["die"]>().toEqualTypeOf<string>();
    expectTypeOf<System["encumbrance"]["level"]>().toEqualTypeOf<string>();
  });
});

describe("items", () => {
  it("resolves each subtype to its model", () => {
    expectTypeOf<Item.SystemOfType<"armor">>().toEqualTypeOf<ArmorDataModel>();
    expectTypeOf<Item.SystemOfType<"flaw">>().toEqualTypeOf<FlawDataModel>();
    expectTypeOf<Item.SystemOfType<"item">>().toEqualTypeOf<ItemDataModel>();
    expectTypeOf<Item.SystemOfType<"talent">>().toEqualTypeOf<TalentDataModel>();
    expectTypeOf<Item.SystemOfType<"weapon">>().toEqualTypeOf<WeaponDataModel>();
  });

  it("gives every item the description from OddItemDataBase", () => {
    expectTypeOf<Item.SystemOfType<"armor">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"feature">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"flaw">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"item">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"spell">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"talent">["description"]>().toEqualTypeOf<string>();
    expectTypeOf<Item.SystemOfType<"weapon">["description"]>().toEqualTypeOf<string>();
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
