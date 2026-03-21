/**
 * Character — the primary player-controlled Actor type.
 *
 * Schema mirrors the ODD RPG character sheet:
 * - Base info: player name, XP
 * - Attributes: 8 dice-pool attributes (str, agi, dex, vit, cun, int, wil, per)
 * - Skills: 6 categories (combat, physical, knowledge, social, mental, special)
 * - Statistics: movement rate, composure threshold, healing rate, magic points
 * - Strain tracker: slots, fortitude, manual overrides
 * - Biography: free-form HTML
 */

import { ATTRIBUTES, ATTRIBUTE_DICE_TYPES, DEFAULT_DIE } from "../../config/attributes.js";
import { SKILLS } from "../../config/skills.js";
import { DICE_TYPES } from "../../config/dice.js";
import { STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT, STRAIN_MAX_FORTITUDE_SLOTS } from "../../config/strain.js";

const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } =
  foundry.data.fields;

export class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterDataModel.Schema,
  Actor.Implementation
> {
  static override defineSchema(): CharacterDataModel.Schema {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributeFields: Record<string, any> = {};
    for (const key of Object.keys(ATTRIBUTES)) {
      attributeFields[key] = new StringField({
        required: true,
        initial: DEFAULT_DIE,
        choices: Object.keys(ATTRIBUTE_DICE_TYPES),
      });
    }

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
      playerName: new StringField({ required: true, blank: true, initial: "" }),
      xp: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),
      attributes: new SchemaField(attributeFields),
      skills: new SchemaField(skillCategoryFields),
      statistics: new SchemaField({
        movementRate: new NumberField({ required: true, integer: true, min: 0, initial: 4 }),
        composureThreshold: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
        healingRate: new NumberField({ required: true, integer: true, min: 0, initial: 4 }),
        magicPoints: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        }),
      }),
      strain: new SchemaField({
        slots: new ArrayField(
          new StringField({ required: true, blank: true, initial: "", choices: Object.keys(STRAIN_VALUES) }),
          { initial: Array(STRAIN_MAX_FORTITUDE_SLOTS + STRAIN_DEFAULT_SLOT_COUNT).fill("") as string[] },
        ),
        fortitudeSlots: new NumberField({ required: true, integer: true, min: 0, max: STRAIN_MAX_FORTITUDE_SLOTS, initial: 0 }),
        fortitudeManualOverride: new BooleanField({ required: true, initial: false }),
        fortitudeManualSlots: new ArrayField(
          new BooleanField({ required: true, initial: false }),
          { initial: Array(STRAIN_MAX_FORTITUDE_SLOTS).fill(false) as boolean[] },
        ),
      }),
      biography: new HTMLField({ required: true, blank: true }),
      rollModifiers: new ObjectField({ initial: {} }),
    } as CharacterDataModel.Schema;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override prepareDerivedData(this: any): void {
    super.prepareDerivedData();
    const mp = this.statistics.magicPoints;
    mp.value = Math.clamp(mp.value, 0, mp.max);
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CharacterDataModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, sonarjs/redundant-type-aliases
  export type Schema = any;
}

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
    fortitudeManualOverride: boolean;
    fortitudeManualSlots: boolean[];
  };
  biography: string;
  rollModifiers: Record<string, string>;
  health: { value: number; max: number };
}

export default CharacterDataModel;
