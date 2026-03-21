import { BaseItemDataModel } from "../_base.js";

/** Feature — a special ability or trait. */
export class FeatureDataModel extends BaseItemDataModel {
  static override defineSchema() {
    return { ...super.defineSchema() };
  }
}

export default FeatureDataModel;
