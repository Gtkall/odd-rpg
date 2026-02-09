/**
 * ODD RPG — Custom Document implementations
 *
 * These extend the core Actor and Item classes with system-specific logic.
 */

/**
 * Extended Actor class for the ODD RPG system.
 */
export class OddActor extends Actor {
  /**
   * Apply damage to this Actor, reducing health.
   * @param amount - The raw damage amount.
   */
  async applyDamage(amount: number): Promise<void> {
    amount = Math.round(Math.max(1, amount));
    const system = this.system as any;
    const currentHealth = system.health.value;
    await this.update({
      "system.health.value": Math.max(0, currentHealth - amount),
    } as any);

    await ChatMessage.implementation.create({
      content: `${this.name} took ${amount} damage!`,
    } as any);
  }

  /**
   * Heal this Actor, restoring health.
   * @param amount - The amount to heal.
   */
  async applyHealing(amount: number): Promise<void> {
    amount = Math.round(Math.max(0, amount));
    const system = this.system as any;
    const { value, max } = system.health;
    await this.update({
      "system.health.value": Math.min(max, value + amount),
    } as any);
  }
}

/**
 * Extended Item class for the ODD RPG system.
 */
export class OddItem extends Item {
  /**
   * Convenience: post this item's details to chat.
   */
  async toChat(): Promise<void> {
    const system = this.system as any;
    const content = `
      <div class="odd-chat-item">
        <h3>${this.name}</h3>
        <p>${system.description ?? ""}</p>
      </div>
    `;
    await ChatMessage.implementation.create({ content } as any);
  }
}
