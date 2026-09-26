import { FLAW_SEVERITIES, FLAW_CATEGORIES } from "../../config/flaw.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { StringField } = foundry.data.fields;

function defineFlawSchema() {
  return {
    ...defineItemBaseSchema(),
    severity:    new StringField({ required: true, initial: "minor",  choices: Object.keys(FLAW_SEVERITIES) }),
    category:    new StringField({ required: true, initial: "mental", choices: Object.keys(FLAW_CATEGORIES) }),
  };
}

type FlawSchema = ReturnType<typeof defineFlawSchema>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- TypeDataModel requires AnyObject, which interfaces do not satisfy.
type FlawDerivedData = {
  xpValue: number;
  symbol:  string;
};

/** Flaw — a character hindrance that grants XP. */
export class FlawDataModel extends OddItemDataBase<FlawSchema, FlawDerivedData> {
  static override defineSchema(): FlawSchema {
    return defineFlawSchema();
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    const severity = FLAW_SEVERITIES[this.severity as keyof typeof FLAW_SEVERITIES];
    this.xpValue = severity.xp;
    this.symbol  = severity.symbol;
  }
}

export default FlawDataModel;
