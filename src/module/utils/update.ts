/**
 * Update a document using dot-notation keys, e.g. `"system.wounds.head.state"`.
 *
 * Foundry accepts dot-notation update data at runtime, but fvtt-types only
 * models nested update objects, so the cast for it lives here, once.
 */
export function updateByPath(
  doc: Actor.Implementation | Item.Implementation,
  changes: Record<string, unknown>,
): Promise<unknown> {
  return doc.update(changes as Actor.UpdateData & Item.UpdateData);
}
