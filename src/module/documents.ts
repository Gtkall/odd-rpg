/**
 * ODD RPG — Custom Document implementations
 *
 * These extend the core Actor and Item classes with system-specific logic.
 */

import type { BaseItemSystemData, CharacterSystemData } from "./data-models";

/**
 * Extended Actor class for the ODD RPG system.
 */
export class OddActor extends Actor {
  get characterSystem(): CharacterSystemData {
    return this.system as unknown as CharacterSystemData;
  }

  /**
   * Apply damage to this Actor, reducing health.
   * @param amount - The raw damage amount.
   */
  async applyDamage(amount: number): Promise<void> {
    amount = Math.round(Math.max(1, amount));
    const { health } = this.characterSystem;
    await this.update({
      "system.health.value": Math.max(0, health.value - amount),
    } as any); // dotted-path updates — Foundry stub limitation

    await ChatMessage.implementation.create({
      content: `${this.name} took ${amount} damage!`,
    } as any); // ChatMessage types incomplete in v13 stubs
  }

  /**
   * Heal this Actor, restoring health.
   * @param amount - The amount to heal.
   */
  async applyHealing(amount: number): Promise<void> {
    amount = Math.round(Math.max(0, amount));
    const { health } = this.characterSystem;
    await this.update({
      "system.health.value": Math.min(health.max, health.value + amount),
    } as any); // dotted-path updates — Foundry stub limitation
  }
}

/**
 * Extended Item class for the ODD RPG system.
 */
export class OddItem extends Item {
  get itemSystem(): BaseItemSystemData {
    return this.system as unknown as BaseItemSystemData;
  }

  /**
   * Convenience: post this item's details to chat.
   */
  async toChat(): Promise<void> {
    const content = `
      <div class="odd-chat-item">
        <h3>${this.name}</h3>
        <p>${this.itemSystem.description ?? ""}</p>
      </div>
    `;
    await ChatMessage.implementation.create({ content } as any); // ChatMessage types incomplete in v13 stubs
  }
}
