import type { BaseItemSystemData } from "../data/_base.js";

export class OddItem extends Item {
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
