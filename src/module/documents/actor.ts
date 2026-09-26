import type { CharacterDataModel } from "../data/actor/character.js";
import { updateByPath } from "../utils/update.js";

export class OddActor extends Actor {
  get characterSystem(): CharacterDataModel {
    return this.system;
  }

  async applyDamage(amount: number): Promise<void> {
    amount = Math.round(Math.max(1, amount));
    // @ts-expect-error `health` was removed from the character schema in fd0fe2f; this method has no callers.
    const { health } = this.characterSystem;
    await updateByPath(this, {
      "system.health.value": Math.max(0, health.value - amount),
    });

    await ChatMessage.implementation.create({
      content: `${this.name} took ${amount} damage!`,
    });
  }

  async applyHealing(amount: number): Promise<void> {
    amount = Math.round(Math.max(0, amount));
    // @ts-expect-error `health` was removed from the character schema in fd0fe2f; this method has no callers.
    const { health } = this.characterSystem;
    await updateByPath(this, {
      "system.health.value": Math.min(health.max, health.value + amount),
    });
  }
}
