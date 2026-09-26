import { OddItemDataBase } from "../abstract/item-base.js";

/** Feature — a special ability or trait. */
export class FeatureDataModel extends OddItemDataBase {
  static override defineSchema() {
    return { ...super.defineSchema() };
  }
}

export default FeatureDataModel;
