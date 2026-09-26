import { INJURY_MAX_WOUNDS, INJURY_SEVERITIES } from "../../config/wounds.js";
import { isItemType } from "../../utils/item-type.js";
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
export class InjuryDataModel extends OddItemDataBase<InjurySchema> {
  static override defineSchema(): InjurySchema {
    return defineInjurySchema();
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
