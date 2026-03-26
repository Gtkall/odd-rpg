/**
 * OddCombat — Custom Combat document.
 *
 * - Disables Foundry's built-in initiative rolling (use character sheet instead).
 * - Sorts combatants descending by Initiative Index (higher acts first).
 */
export class OddCombat extends Combat {
  /** Redirect GMs to roll from the character sheet. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/require-await
  override async rollInitiative(..._args: any[]): Promise<this> {
    ui.notifications?.info(game.i18n!.localize("ODD.Tracker.rollFromSheet"));
    return this;
  }

  /** Descending sort by II; alphabetical tiebreak. */
  override _sortCombatants(a: Combatant, b: Combatant): number {
    const ia = a.initiative ?? -Infinity;
    const ib = b.initiative ?? -Infinity;
    if (ib !== ia) return ib - ia;
    return (a.name ?? "").localeCompare(b.name ?? "");
  }
}
