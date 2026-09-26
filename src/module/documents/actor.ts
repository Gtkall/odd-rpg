import { creatableTypes } from "../settings.js";

export class OddActor extends Actor {
  /** Offer only the active ruleset's actor types in the "Create Actor" dialog. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override createDialog(...args: any[]): Promise<Actor | null | undefined> {
    const [data, createOptions, options] = args as [Record<string, unknown>?, Record<string, unknown>?, Record<string, unknown>?];
    const rulesetTypes = creatableTypes("Actor");
    const allowedTypes = (Actor.TYPES as string[]).filter(t => rulesetTypes.includes(t));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.createDialog(data, createOptions, { ...options, types: allowedTypes } as any);
  }
}
