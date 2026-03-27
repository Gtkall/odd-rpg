import type { BaseItemSystemData } from "../data/_base.js";

// Item types hidden from the creation dialog.
// "feature" is removed from the ODD system entirely.
// "spell" and "item" are commented out here — planned for future implementation.
const HIDDEN_TYPES = new Set([
  "feature",
  // "spell",
  // "item",
]);

export class OddItem extends Item {
  /** Filter the types shown in Foundry's "Create Item" dialog. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _createDialogTypes(): string[] {
    return (Item.TYPES as string[]).filter(t => !HIDDEN_TYPES.has(t));
  }
  get itemSystem(): BaseItemSystemData {
    return this.system as unknown as BaseItemSystemData;
  }

  async toChat(): Promise<void> {
    const content = `
      <div class="odd-chat-item">
        <h3>${this.name}</h3>
        <p>${this.itemSystem.description}</p>
      </div>
    `;
    await ChatMessage.implementation.create({ content } as any); // ChatMessage types incomplete in v13 stubs
  }
}
