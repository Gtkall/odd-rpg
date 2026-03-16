/**
 * ODD RPG — Data Models
 *
 * Defines the TypeDataModel schemas for all Actor and Item sub-types.
 * These schemas determine what data is stored on each document's `system` field.
 */

import {
  ATTRIBUTES, SKILLS, ATTRIBUTE_DICE_TYPES, DICE_TYPES, DEFAULT_DIE,
  STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT, STRAIN_MAX_FORTITUDE_SLOTS,
} from "./config";
import { OddActorSheet, OddItemSheet } from "./sheets";

const { ArrayField, HTMLField, NumberField, SchemaField, StringField } =
  foundry.data.fields;

/* ========================================================================== */
/*  Actor Data Models                                                         */
/* ========================================================================== */

/**
 * Character — the primary player-controlled Actor type.
 *
 * Schema mirrors the ODD RPG character sheet:
 * - Base info: player name, XP
 * - Attributes: 8 dice-pool attributes (str, agi, dex, vit, cun, int, wil, per)
 * - Skills: 6 categories (combat, physical, knowledge, social, mental, special)
 * - Statistics: movement rate, composure threshold, healing rate, magic points
 * - Biography: free-form HTML
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterDataModel.Schema,
  Actor.Implementation
> {
  static readonly sheetClass = OddActorSheet;

  static override defineSchema(): CharacterDataModel.Schema {
    // --- Attribute fields (each a die-value string) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributeFields: Record<string, any> = {};
    for (const key of Object.keys(ATTRIBUTES)) {
      attributeFields[key] = new StringField({
        required: true,
        initial: DEFAULT_DIE,
        choices: Object.keys(ATTRIBUTE_DICE_TYPES),
      });
    }

    // --- Skill fields (grouped by category, each a die-value or "" for untrained) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skillCategoryFields: Record<string, any> = {};
    for (const [category, skills] of Object.entries(SKILLS)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categorySkills: Record<string, any> = {};
      for (const skillKey of Object.keys(skills)) {
        categorySkills[skillKey] = new StringField({
          required: true,
          blank: true,
          initial: "",
          choices: Object.keys(DICE_TYPES),
        });
      }
      skillCategoryFields[category] = new SchemaField(categorySkills);
    }

    return {
      // Base character info
      playerName: new StringField({ required: true, blank: true, initial: "" }),
      xp: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      // Attributes
      attributes: new SchemaField(attributeFields),

      // Skills
      skills: new SchemaField(skillCategoryFields),

      // Statistics
      statistics: new SchemaField({
        movementRate: new NumberField({ required: true, integer: true, min: 0, initial: 4 }),
        composureThreshold: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
        healingRate: new NumberField({ required: true, integer: true, min: 0, initial: 4 }),
        magicPoints: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        }),
      }),

      // Strain
      strain: new SchemaField({
        slots: new ArrayField(
          new StringField({ required: true, blank: true, initial: "", choices: Object.keys(STRAIN_VALUES) }),
          { initial: Array(STRAIN_MAX_FORTITUDE_SLOTS + STRAIN_DEFAULT_SLOT_COUNT).fill("") as string[] },
        ),
        fortitudeSlots: new NumberField({ required: true, integer: true, min: 0, max: STRAIN_MAX_FORTITUDE_SLOTS, initial: 0 }),
      }),

      // Biography
      biography: new HTMLField({ required: true, blank: true }),
    } as CharacterDataModel.Schema;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override prepareDerivedData(this: any): void {
    super.prepareDerivedData();

    // Clamp magic points within range
    const mp = this.statistics.magicPoints;
    mp.value = Math.clamp(mp.value, 0, mp.max);
  }
}

/** TypeScript shape of a character's `system` object, mirroring `CharacterDataModel`. */
export interface CharacterSystemData {
  playerName: string;
  xp: { value: number; max: number };
  attributes: Record<string, string>;
  skills: Record<string, Record<string, string>>;
  statistics: {
    movementRate: number;
    composureThreshold: number;
    healingRate: number;
    magicPoints: { value: number; max: number };
  };
  strain: {
    slots: string[];
    fortitudeSlots: number;
  };
  biography: string;
  health: { value: number; max: number };
}

/** TypeScript shape shared by all item `system` objects. */
export interface BaseItemSystemData {
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CharacterDataModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, sonarjs/redundant-type-aliases
  export type Schema = any; // Foundry's schema types are not expressible without any
}

/* ========================================================================== */
/*  Item Data Models                                                          */
/* ========================================================================== */

/**
 * Base class for all Item sub-types, providing shared fields.
 */
class BaseItemDataModel extends foundry.abstract.TypeDataModel<
  any, // Foundry schema types are not expressible without any
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
  static readonly sheetClass = OddItemSheet;

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
  static readonly sheetClass = OddItemSheet;

  static override defineSchema() {
    return {
      ...super.defineSchema(),
    };
  }
}

/**
 * Spell — a castable magical effect.
 */
export class SpellDataModel extends BaseItemDataModel {
  static readonly sheetClass = OddItemSheet;

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
