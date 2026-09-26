/**
 * Base class for every ODD RPG character data model, and the RollingActor
 * contract the shared sheet engine (dice pool, common and saved rolls) codes
 * against.
 *
 * Lives outside data/actor/ so the auto-discovery glob in odd-rpg.ts does not
 * register it as an Actor type.
 */

import type { CommonRollDef, RollSource } from "../../config/rolls.js";

const { ArrayField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

/** One die in a dice pool, with the label shown on its chip and in chat. */
export interface PoolEntry {
  label: string;
  die: string;
}

export interface SavedRoll {
  id: string;
  name: string;
  dice: PoolEntry[];
  flat: number | null;
}

/** What the shared sheet engine needs from an actor's system data. */
export interface RollingActor {
  readonly rollModifiers: Record<string, string>;
  readonly savedRolls: readonly SavedRoll[];
  /** Predefined rolls this ruleset offers, in display order. */
  readonly commonRolls: readonly CommonRollDef[];
  /** The die and localized label a roll source contributes; `die` is "" when the actor has none. */
  resolveRollSource(source: RollSource): PoolEntry;
}

export function defineCharacterBaseSchema() {
  return {
    playerName: new StringField({ required: true, blank: true, initial: "" }),
    xp: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    }),
    biography: new HTMLField({ required: true, blank: true }),
    rollModifiers: new ObjectField({ initial: {} }),
    savedRolls: new ArrayField(
      new SchemaField({
        id:   new StringField({ required: true, blank: false }),
        name: new StringField({ required: true, blank: true, initial: "Saved Roll" }),
        dice: new ArrayField(
          new SchemaField({
            label: new StringField({ required: true, blank: true }),
            die:   new StringField({ required: true, blank: false }),
          }),
        ),
        flat: new NumberField({ required: true, initial: 0 }),
      }),
      { initial: [] },
    ),
  };
}

export type CharacterBaseSchema = ReturnType<typeof defineCharacterBaseSchema>;

// fvtt-types types an ObjectField as an untyped object, so its real shape is
// declared here.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- TypeDataModel requires AnyObject, which interfaces do not satisfy.
export type CharacterBaseKeyedData = {
  rollModifiers: Record<string, string>;
};

/**
 * Concrete subclasses declare `implements RollingActor`: under a generic schema
 * fvtt-types cannot resolve the fields to their declared types, so the check
 * only works once the schema is fixed.
 */
export abstract class OddCharacterDataBase<
  Schema extends CharacterBaseSchema = CharacterBaseSchema,
  BaseData extends CharacterBaseKeyedData = CharacterBaseKeyedData,
> extends foundry.abstract.TypeDataModel<Schema, Actor.Implementation, BaseData> {
  static override defineSchema(): CharacterBaseSchema {
    return defineCharacterBaseSchema();
  }

  abstract get commonRolls(): readonly CommonRollDef[];

  abstract resolveRollSource(source: RollSource): PoolEntry;

  /** Whether an Item of this type may be created on, or dropped onto, this character. */
  abstract acceptsItemType(type: string): boolean;
}
