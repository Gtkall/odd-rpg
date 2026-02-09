/**
 * ODD RPG — Data Models
 *
 * Defines the TypeDataModel schemas for all Actor and Item sub-types.
 * These schemas determine what data is stored on each document's `system` field.
 *
 * Placeholder attributes are intentionally minimal — expand these as the
 * ODD RPG rules are fleshed out.
 */

const { HTMLField, NumberField, SchemaField } = foundry.data.fields;

/* ========================================================================== */
/*  Actor Data Models                                                         */
/* ========================================================================== */

/**
 * Character — the primary player-controlled Actor type.
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterDataModel.Schema,
  Actor.Implementation
> {
  static override defineSchema(): CharacterDataModel.Schema {
    return {
      health: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
        }),
      }),
      level: new NumberField({
        required: true,
        integer: true,
        min: 1,
        initial: 1,
      }),
      biography: new HTMLField({ required: true, blank: true }),
    } as CharacterDataModel.Schema;
  }

  override prepareDerivedData(this: any): void {
    super.prepareDerivedData();
    const health = this.health;
    health.value = Math.min(health.value, health.max);
    health.value = Math.max(0, health.value);
  }
}

export namespace CharacterDataModel {
  export type Schema = any;
}

/* ========================================================================== */
/*  Item Data Models                                                          */
/* ========================================================================== */

/**
 * Base class for all Item sub-types, providing shared fields.
 */
class BaseItemDataModel extends foundry.abstract.TypeDataModel<
  any,
  Item.Implementation
> {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
    };
  }
}

/**
 * Generic Item (equipment, consumable, etc.)
 */
export class ItemDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      quantity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1,
      }),
      weight: new NumberField({
        required: true,
        min: 0,
        initial: 0,
      }),
    };
  }
}

/**
 * Feature — a special ability or trait.
 */
export class FeatureDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      // Placeholder — add activation costs, usage limits, etc. later.
    };
  }
}

/**
 * Spell — a castable magical effect.
 */
export class SpellDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      spellLevel: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1,
      }),
    };
  }
}
