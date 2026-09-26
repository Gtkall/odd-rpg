/**
 * Narrow an item to one subtype by checking its `type`.
 *
 * `Item.Implementation` spans every subtype at once, so comparing `item.type`
 * directly does not narrow `item.system`; this predicate does.
 */
export function isItemType<T extends Item.SubType>(
  item: Item.Implementation,
  type: T,
): item is Item.OfType<T> {
  return item.type === type;
}
