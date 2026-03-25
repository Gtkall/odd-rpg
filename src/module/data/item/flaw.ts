import { FLAW_SEVERITIES, FLAW_CATEGORIES } from "../../config/flaw.js";

const { HTMLField, StringField } = foundry.data.fields;

/** Flaw — a character hindrance that grants XP. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FlawDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      severity:    new StringField({ required: true, initial: "minor",  choices: Object.keys(FLAW_SEVERITIES) }),
      category:    new StringField({ required: true, initial: "mental", choices: Object.keys(FLAW_CATEGORIES) }),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override prepareDerivedData(this: any): void {
    super.prepareDerivedData();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const severity = FLAW_SEVERITIES[this.severity as keyof typeof FLAW_SEVERITIES];
    this.xpValue = severity.xp;
    this.symbol  = severity.symbol;
  }
}

export interface FlawSystemData {
  description: string;
  severity:    string;
  category:    string;
  xpValue:     number;
  symbol:      string;
}

export default FlawDataModel;
