import { DieTraitDataBase } from "../abstract/die-trait-base.js";

/** ODDEasy Talent — a short descriptor whose die is a Bonus when it applies. */
export class EasyTalentDataModel extends DieTraitDataBase {
  protected readonly isPenalty = false;
}

export default EasyTalentDataModel;
