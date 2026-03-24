import { WEAPON_TYPES, WEAPON_HANDS, WEAPON_DISTANCE, WEAPON_TEMPO_MIN, WEAPON_TEMPO_MAX } from "../../config/weapon.js";
import { DICE_TYPES } from "../../config/dice.js";
import type { OddItemBase } from "../_base.js";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } =
  foundry.data.fields;

function weaponHandSchema() {
  return new SchemaField({
    tempos: new NumberField({ required: true, integer: true, min: WEAPON_TEMPO_MIN, max: WEAPON_TEMPO_MAX, initial: 5 }),
    distance: new StringField({ required: true, initial: "M", choices: Object.keys(WEAPON_DISTANCE) }),
    accuracy: new StringField({ required: true, initial: "d6", choices: Object.keys(DICE_TYPES) }),
    damage: new SchemaField({
      diceCount: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      dieType: new StringField({ required: true, initial: "d6", choices: Object.keys(DICE_TYPES) }),
      isBonus: new BooleanField({ required: true, initial: false }),
    }),
  });
}

/** Weapon — a melee or ranged attack item. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class WeaponDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      weaponType: new StringField({ required: true, initial: "melee", choices: Object.keys(WEAPON_TYPES) }),
      hands: new StringField({ required: true, initial: "versatile", choices: Object.keys(WEAPON_HANDS) }),
      oneHanded: weaponHandSchema(),
      twoHanded: weaponHandSchema(),
      notes: new ArrayField(
        new StringField({ required: true, blank: false }),
        { required: true, initial: [] },
      ),
      equipped: new BooleanField({ required: true, initial: false }),
    };
  }
}

export interface WeaponSystemData extends OddItemBase {
  equipped: boolean;
  weaponType: "melee" | "ranged";
  hands: "1h" | "2h" | "versatile";
  oneHanded: WeaponHandConfig;
  twoHanded: WeaponHandConfig;
}

export interface WeaponHandConfig {
  tempos: number;
  distance: string;
  accuracy: string;
  damage: { diceCount: number; dieType: string; isBonus: boolean };
}

export default WeaponDataModel;
