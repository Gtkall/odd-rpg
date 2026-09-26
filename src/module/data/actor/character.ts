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
import { SKILLS, SKILL_CATEGORIES } from "../../config/skills.js";
import { DICE_TYPES } from "../../config/dice.js";
import { STRAIN_VALUES, STRAIN_DEFAULT_SLOT_COUNT, STRAIN_MAX_FORTITUDE_SLOTS } from "../../config/strain.js";
import { ENCUMBRANCE_LEVELS } from "../../config/encumbrance.js";
import {
  HIT_LOCATION_ORDER, WOUND_BASE_STATES, WOUND_SUB_STATUSES,
  PAIN_PENALTY_DICE, PAIN_PENALTY_DEFAULT,
} from "../../config/wounds.js";
import type { WoundLocationKey } from "../../config/wounds.js";

const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } =
  foundry.data.fields;

function defineCharacterSchema() {
  const attributeFields = Object.fromEntries(
    Object.keys(ATTRIBUTES).map((key) => [
      key,
      new StringField({
        required: true,
        initial: DEFAULT_DIE,
        choices: Object.keys(ATTRIBUTE_DICE_TYPES),
      }),
    ] as const),
  );

  const skillCategoryFields = Object.fromEntries(
    Object.entries(SKILLS).map(([category, skills]) => [
      category,
      new SchemaField(
        Object.fromEntries(
          Object.keys(skills).map((skillKey) => [
            skillKey,
            new StringField({
              required: true,
              blank: true,
              initial: "",
              choices: Object.keys(DICE_TYPES),
            }),
          ] as const),
        ),
      ),
    ] as const),
  );

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
    customSkills: new ArrayField(
      new SchemaField({
        id:       new StringField({ required: true, blank: false }),
        name:     new StringField({ required: true, blank: true, initial: "" }),
        category: new StringField({ required: true, blank: false, initial: "combat", choices: Object.keys(SKILL_CATEGORIES) }),
        die:      new StringField({ required: true, blank: true, initial: "", choices: Object.keys(DICE_TYPES) }),
      }),
      { initial: [] },
    ),
    encumbrance: new SchemaField({
      level: new StringField({ required: true, blank: false, initial: "none", choices: Object.keys(ENCUMBRANCE_LEVELS) }),
    }),
    painPenaltyDie: new StringField({
      required: true, initial: PAIN_PENALTY_DEFAULT,
      choices: Object.keys(PAIN_PENALTY_DICE),
    }),
    wounds: new SchemaField(
      Object.fromEntries(
        HIT_LOCATION_ORDER.map((key) => [
          key,
          new SchemaField({
            state: new StringField({
              required: true, initial: "uninjured",
              choices: Object.keys(WOUND_BASE_STATES),
            }),
            subStatus: new StringField({
              required: true, initial: "blunt",
              choices: Object.keys(WOUND_SUB_STATUSES),
            }),
          }),
        ] as const),
      ),
    ),
  };
}

type CharacterSchema = ReturnType<typeof defineCharacterSchema>;

// fvtt-types infers a SchemaField whose keys come from config (via
// Object.fromEntries) as `{}`, and an ObjectField as an untyped object, so the
// real shapes of those fields are declared here.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- TypeDataModel requires AnyObject, which interfaces do not satisfy.
type CharacterConfigKeyedData = {
  attributes:    Record<string, string>;
  skills:        Record<string, Record<string, string>>;
  wounds:        Record<WoundLocationKey, { state: string; subStatus: string }>;
  rollModifiers: Record<string, string>;
};

export class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterSchema,
  Actor.Implementation,
  CharacterConfigKeyedData
> {
  static override defineSchema(): CharacterSchema {
    return defineCharacterSchema();
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    const mp = this.statistics.magicPoints;
    // NumberField is nullable by default; Math.clamp already treated null as 0.
    mp.value = Math.clamp(mp.value ?? 0, 0, mp.max ?? 0);
  }
}

export default CharacterDataModel;
