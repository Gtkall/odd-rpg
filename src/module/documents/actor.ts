import type { CharacterSystemData } from "../data/actor/character.js";

export class OddActor extends Actor {
  get characterSystem(): CharacterSystemData {
    return this.system as unknown as CharacterSystemData;
  }

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

  async applyHealing(amount: number): Promise<void> {
    amount = Math.round(Math.max(0, amount));
    const { health } = this.characterSystem;
    await this.update({
      "system.health.value": Math.min(health.max, health.value + amount),
    } as any); // dotted-path updates — Foundry stub limitation
  }
}
