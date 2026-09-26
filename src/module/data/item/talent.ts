import { TALENT_TYPES, TALENT_RANKS, TALENT_CATEGORIES, TALENT_XP_COSTS } from "../../config/talent.js";
import { OddItemDataBase, defineItemBaseSchema } from "../abstract/item-base.js";

const { ArrayField, HTMLField, SchemaField, StringField } = foundry.data.fields;

function defineTalentSchema() {
  return {
    ...defineItemBaseSchema(),
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

type TalentSchema = ReturnType<typeof defineTalentSchema>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- TypeDataModel requires AnyObject, which interfaces do not satisfy.
type TalentDerivedData = {
  xpCost: number;
};

/** Talent — a node in a character's talent tree. */
export class TalentDataModel extends OddItemDataBase<TalentSchema, TalentDerivedData> {
  override prepareDerivedData(): void {
    super.prepareDerivedData();
    const key = this.talentType === "main" ? `main:${this.rank}` : this.talentType;
    this.xpCost = (TALENT_XP_COSTS[key] as number | undefined) ?? 0;
  }

  static override defineSchema(): TalentSchema {
    return defineTalentSchema();
  }
}

export default TalentDataModel;
