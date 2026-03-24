import { TALENT_TYPES, TALENT_RANKS, TALENT_CATEGORIES, TALENT_XP_COSTS } from "../../config/talent.js";

const { ArrayField, HTMLField, SchemaField, StringField } = foundry.data.fields;

/** Talent — a node in a character's talent tree. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TalentDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override prepareDerivedData(this: any): void {
    super.prepareDerivedData();
    const key = this.talentType === "main" ? `main:${this.rank}` : this.talentType;
    this.xpCost = (TALENT_XP_COSTS[key] as number | undefined) ?? 0;
  }

  static override defineSchema() {
    return {
      description:   new HTMLField({ required: true, blank: true }),
      talentType:    new StringField({ required: true, initial: "main", choices: Object.keys(TALENT_TYPES) }),
      rank:          new StringField({ required: true, blank: true, initial: "I", choices: Object.keys(TALENT_RANKS) }),
      category:      new StringField({ required: true, initial: "combat", choices: Object.keys(TALENT_CATEGORIES) }),
      treeName:      new StringField({ required: true, blank: true, initial: "" }),
      parentId:      new StringField({ required: true, blank: true, initial: "" }),
      prerequisites: new StringField({ required: true, blank: true, initial: "" }),
      effects:       new ArrayField(
        new SchemaField({
          title: new StringField({ required: true, blank: true, initial: "" }),
          body:  new HTMLField({ required: true, blank: true }),
        }),
        { required: true, initial: [] },
      ),
    };
  }
}

export interface TalentSystemData {
  description:   string;
  talentType:    string;
  category:      string;
  rank:          string;
  treeName:      string;
  parentId:      string;
  prerequisites: string;
  effects:       { title: string; body: string }[];
  xpCost:        number;
}

export default TalentDataModel;
