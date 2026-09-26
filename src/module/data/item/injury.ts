import { INJURY_MAX_WOUNDS, INJURY_SEVERITIES, INJURY_WOUNDED_PENALTY } from "../../config/wounds.js";
import { isItemType } from "../../utils/item-type.js";
import type { PoolEntry } from "../abstract/character-base.js";
import type { DicePoolSource } from "../abstract/dice-pool-source.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { StringField } = foundry.data.fields;

function defineInjurySchema() {
  return {
    ...defineItemBaseSchema(),
    severity: new StringField({ required: true, initial: "wounded", choices: Object.keys(INJURY_SEVERITIES) }),
  };
}

type InjurySchema = ReturnType<typeof defineInjurySchema>;

/** ODDEasy Injury — a named Wound or Crippling injury. */
export class InjuryDataModel extends OddItemDataBase<InjurySchema> implements DicePoolSource {
  static override defineSchema(): InjurySchema {
    return defineInjurySchema();
  }

  /**
   * A Wound is a Penalty on a Test it would hinder. A Crippling injury adds no
   * die: when it applies, the Test is simply a Failure.
   */
  toPoolEntry(): PoolEntry | null {
    return this.severity === "wounded" ? { label: this.parent.name, die: `-${INJURY_WOUNDED_PENALTY}` } : null;
  }

  /** A Wound beyond the maximum a character can carry becomes Crippling instead. */
  protected override async _preCreate(
    ...args: Parameters<OddItemDataBase<InjurySchema>["_preCreate"]>
  ): Promise<boolean | void> {
    if ((await super._preCreate(...args)) === false) return false;
    const actor = this.parent.actor;
    if (this.severity !== "wounded" || !actor) return;
    const wounds = actor.items.filter((i) => isItemType(i, "injury") && i.system.severity === "wounded");
    if (wounds.length < INJURY_MAX_WOUNDS) return;
    this.parent.updateSource({ system: { severity: "crippled" } });
    ui.notifications.info(game.i18n.format("ODD.Injury.becameCrippled", { name: this.parent.name }));
  }
}

export default InjuryDataModel;
