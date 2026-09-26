import { creatableTypes } from "../settings.js";

// Item types hidden from the "Create Item" dialog.
// "feature" is removed from the ODD system entirely.
// "spell" and "item" are commented out here — planned for future implementation.
const HIDDEN_TYPES = new Set([
  "feature",
  // "spell",
  // "item",
]);

export class OddItem<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
  /** Offer only the active ruleset's item types, minus hidden ones, in the "Create Item" dialog. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override createDialog(...args: any[]): Promise<Item | null | undefined> {
    const [data, createOptions, options] = args as [Record<string, unknown>?, Record<string, unknown>?, Record<string, unknown>?];
    const rulesetTypes = creatableTypes("Item");
    const allowedTypes = (Item.TYPES as string[]).filter(t => rulesetTypes.includes(t) && !HIDDEN_TYPES.has(t));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    return super.createDialog(data, createOptions, { ...options, types: allowedTypes } as any);
  }
  get itemSystem() {
    return this.system;
  }

  async toChat(): Promise<void> {
    const content = `
      <div class="odd-chat-item">
        <h3>${this.name}</h3>
        <p>${this.itemSystem.description}</p>
      </div>
    `;
    await ChatMessage.implementation.create({ content });
  }
}
