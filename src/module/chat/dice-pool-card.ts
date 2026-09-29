/**
 * The dice pool roll's chat card, and Pushing Yourself from it (ODDEasy p. 11):
 * suffer 1 Fatigue (or 1 Exhaustion, the GM's call for long-term activities)
 * to reroll one of the dice rolled in a Test and keep the best result.
 *
 * The card keeps its dice in the message's flags, so a push can re-render it.
 */

import type { RollResolution } from "../config/rolls.js";
import { EASY_EXHAUSTION_SLOT, EASY_FATIGUE_SLOT, type EasyStrainKind } from "../config/strain.js";
import { isStrainSufferer } from "../data/abstract/strain-sufferer.js";

/** One die on a roll's chat card. */
export interface BreakdownEntry {
  label: string;
  die: string;
  result: number | string;
  discarded?: boolean;
  hitch?: boolean;
  fate?: boolean;
  /** Subtracted from the total, so the card shows "−" before it. */
  penalty?: boolean;
  /** The result before this die was pushed. */
  pushedFrom?: number;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- renderTemplate and flags require AnyObject, which interfaces do not satisfy.
export type DicePoolCard = {
  total: number;
  breakdown: BreakdownEntry[];
  isKeepHighest: boolean;
  hitches: number;
  snakeEyes: boolean;
  /** Set once the Test is pushed; a Test is pushed only once. */
  push?: { die: string; from: number; to: number; exhaustion: boolean };
};

/**
 * Marks every Hitch (a 1 on a rolled Bonus die) and reports the count, and
 * Snake Eyes when every Bonus die is a 1. A Penalty die's 1 is no Hitch; it
 * works for the roller. Initiative has no Hitches.
 */
export function markHitches(
  breakdown: BreakdownEntry[],
  resolution: RollResolution,
): { hitches: number; snakeEyes: boolean } {
  if (resolution !== "sum") return { hitches: 0, snakeEyes: false };
  const bonusDice = breakdown.filter((d) => !d.discarded && !d.die.startsWith("-"));
  for (const d of bonusDice) d.hitch = d.result === 1;
  const hitches = bonusDice.filter((d) => d.hitch).length;
  return { hitches, snakeEyes: hitches > 0 && hitches === bonusDice.length };
}

export function renderDicePoolCard(card: DicePoolCard): Promise<string> {
  return foundry.applications.handlebars.renderTemplate("systems/odd-rpg/templates/chat/dice-pool-roll.hbs", card);
}

/** A rolled Bonus die of the Test itself; Hand of Fate dice come after the push. */
function isPushable(entry: BreakdownEntry | undefined): entry is BreakdownEntry & { result: number } {
  return !!entry && typeof entry.result === "number" && !entry.discarded && !entry.penalty && !entry.fate;
}

/** The card's dice; fvtt-types assumes every message has them, but only dice pool rolls do. */
function getCard(message: ChatMessage.Implementation): DicePoolCard | undefined {
  return message.getFlag("odd-rpg", "dicePool") as DicePoolCard | undefined;
}

/** Messages with a push in flight, so a double click suffers Strain once. */
const pushing = new Set<string>();

/** renderChatMessageHTML: makes a Test's dice clickable while it can still be pushed. */
export function onRenderDicePoolCard(message: ChatMessage.Implementation, html: HTMLElement): void {
  const card = getCard(message);
  if (!card || card.isKeepHighest || card.push || !message.isOwner) return;
  const actor = ChatMessage.getSpeakerActor(message.speaker);
  if (!actor?.isOwner || !isStrainSufferer(actor.system)) return;

  const tooltip = game.i18n.localize("ODD.Roll.pushHint");
  html.querySelectorAll<HTMLElement>(".roll-die-entry[data-index]").forEach((el) => {
    const index = Number(el.dataset.index);
    if (!isPushable(card.breakdown[index])) return;
    el.classList.add("pushable");
    el.dataset.tooltip = tooltip;
    el.addEventListener("click", (ev) => {
      void pushYourself(message, index, ev.shiftKey ? EASY_EXHAUSTION_SLOT : EASY_FATIGUE_SLOT);
    });
  });
}

async function pushYourself(message: ChatMessage.Implementation, index: number, kind: EasyStrainKind): Promise<void> {
  if (pushing.has(message.id!)) return;
  pushing.add(message.id!);
  try {
    const card = foundry.utils.deepClone(getCard(message));
    const actor = ChatMessage.getSpeakerActor(message.speaker);
    const entry = card?.breakdown[index];
    if (!card || card.push || !actor || !isStrainSufferer(actor.system) || !isPushable(entry)) return;

    if (!await actor.system.sufferStrain(kind)) {
      ui.notifications.warn("ODD.Roll.pushStrainFull", { localize: true });
      return;
    }

    const reroll = await new Roll(entry.die).evaluate();
    const from = entry.result;
    const kept = Math.max(from, reroll.total);
    entry.result = kept;
    entry.pushedFrom = from;
    card.total += kept - from;
    Object.assign(card, markHitches(card.breakdown, "sum"));
    card.push = { die: entry.die, from, to: reroll.total, exhaustion: kind === EASY_EXHAUSTION_SLOT };

    await message.update({ content: await renderDicePoolCard(card), flags: { "odd-rpg": { dicePool: card } } });
  } finally {
    pushing.delete(message.id!);
  }
}
