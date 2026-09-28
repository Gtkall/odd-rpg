import { EASY_TWO_HANDED_POWER } from "../../config/weapon.js";
import { dieFaces } from "../../utils/dice-pool.js";
import { EasyCharacterDataModel } from "../actor/easyCharacter.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { BooleanField, NumberField, StringField } = foundry.data.fields;

function defineEasyWeaponSchema() {
  return {
    ...defineItemBaseSchema(),
    power: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    /** Muscle-powered (most melee weapons): Might adds to Power. */
    muscle: new BooleanField({ required: true, initial: false }),
    twoHanded: new BooleanField({ required: true, initial: false }),
    /** Special rules such as Armor-piercing or Flaming, as free text. */
    traits: new StringField({ required: true, blank: true, initial: "" }),
  };
}

type EasyWeaponSchema = ReturnType<typeof defineEasyWeaponSchema>;

/** ODDEasy weapon: its Power adds to the d20 of every Hit it causes. */
export class EasyWeaponDataModel extends OddItemDataBase<EasyWeaponSchema> {
  static override defineSchema(): EasyWeaponSchema {
    return defineEasyWeaponSchema();
  }

  /**
   * What a Hit's Power is made of, each part shown so the table can check it.
   * A muscle-powered weapon adds its wielder's Might value (the number after
   * the "d"), and more when used two-handed.
   */
  get hitPowerParts(): { label: string; value: number }[] {
    const parts = [{ label: "ODD.Easy.power", value: this.power }];
    const wielder = this.parent.actor?.system;
    if (!this.muscle || !(wielder instanceof EasyCharacterDataModel)) return parts;
    parts.push({ label: "ODD.Attributes.might", value: dieFaces(wielder.attributes.might) });
    if (this.twoHanded) parts.push({ label: "ODD.Easy.twoHanded", value: EASY_TWO_HANDED_POWER });
    return parts;
  }

  /** The Power a Hit adds to its d20. */
  get hitPower(): number {
    return this.hitPowerParts.reduce((sum, part) => sum + part.value, 0);
  }
}

export default EasyWeaponDataModel;
