import { DieTraitDataBase } from "../abstract/die-trait-base.js";

/** ODDEasy Flaw — a negative Talent whose die is a Penalty when it applies. */
export class EasyFlawDataModel extends DieTraitDataBase {
  protected readonly isPenalty = true;
}

export default EasyFlawDataModel;
