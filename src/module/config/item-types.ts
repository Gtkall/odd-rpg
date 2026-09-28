/**
 * Item types each character type accepts. Dropping or creating any other type
 * on that character is refused.
 */

export const ODD_ITEM_TYPES: readonly string[] = Object.freeze([
  "armor", "feature", "flaw", "item", "spell", "talent", "weapon",
]);

export const EASY_ITEM_TYPES: readonly string[] = Object.freeze([
  "easyArmor", "easyFlaw", "easyTalent", "easyWeapon", "injury", "item",
]);
