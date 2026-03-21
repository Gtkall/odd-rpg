/**
 * Shared base class and interfaces for all ODD RPG Item data models.
 */

const { HTMLField } = foundry.data.fields;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseItemDataModel extends foundry.abstract.TypeDataModel<any, Item.Implementation> {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
    };
  }
}

export interface BaseItemSystemData {
  description: string;
}

/** Shared interface for all ODD item types that carry free-form tag pills. */
export interface OddItemBase {
  notes: string[];
}
