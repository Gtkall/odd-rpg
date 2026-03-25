/**
 * ODD RPG — Custom TextEditor enrichers.
 *
 * Provides [[/oddPool]] and [[/oddPenalty]] inline tokens that render
 * an interactive button group in talent/flaw effect text.
 *
 * Syntax:
 *   [[/oddPool d8]]                          → bonus die, label "Bonus"
 *   [[/oddPool d8 "Honed Reflexes"]]         → bonus die, custom label
 *   [[/oddPool @attributes.dex "Dexterity"]] → resolves live attribute die
 *   [[/oddPenalty d8 "Penalty"]]             → penalty die (stored as -d8)
 *
 * Click behaviour (wired per-sheet in OddActorSheet._onRender):
 *   🎲  Roll to chat
 *   +B  Add to dice pool as "Bonus" / "Penalty"
 *   🏷  Add to dice pool as the named label (only shown when label ≠ generic)
 */

/** Called once during the `init` Foundry hook. */
export function registerEnrichers(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  (CONFIG as any).TextEditor.enrichers.push({
    // config group is optional (the space + content after the type keyword)
    pattern: /\[\[\/(?<type>oddPool|oddPenalty)(?<config> [^\]]+)?]](?:\{(?<label>[^}]+)\})?/gi,
    enricher: enrichOddPool,
  });
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

// Foundry's enricher signature requires Promise return; no async work needed here.
// eslint-disable-next-line @typescript-eslint/require-await
async function enrichOddPool(
  match: RegExpMatchArray,
  options: Record<string, unknown>,
): Promise<HTMLElement | null> {
  // Named groups are typed as string by TS but config/label are from optional groups.
  const groups = match.groups as Record<string, string | undefined>;
  const type = (groups.type ?? "oddPool").toLowerCase();
  const config = (groups.config ?? "").trim();
  const labelOverride = (groups.label ?? "").trim();
  const isPool = type === "oddpool";

  // Config: first token is the die formula; optional quoted label follows.
  const parsed = /^(\S+)(?:\s+"([^"]+)")?/.exec(config);
  if (!parsed) return null;

  let die = parsed[1];
  const configLabel = (parsed[2] as string | undefined) ?? "";
  const label = labelOverride || configLabel || (isPool ? "Bonus" : "Penalty");

  // Resolve @path references (e.g. @attributes.dex) via rollData.
  if (die.startsWith("@")) {
    const rollData = (options.rollData as Record<string, unknown> | undefined) ?? {};
    const resolved = die
      .slice(1)
      .split(".")
      .reduce<unknown>(
        (obj, key) =>
          obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined,
        rollData,
      );
    if (typeof resolved === "string") die = resolved;
    else return null;
  }

  // Penalty dice are stored with a leading minus so the pool handler knows.
  const storedDie = isPool ? die : `-${die}`;
  const isNamedLabel = label !== "Bonus" && label !== "Penalty";

  // ---- Build button group ----
  const wrap = document.createElement("span");
  wrap.className = `odd-pool-link odd-pool-link--${isPool ? "bonus" : "penalty"}`;
  wrap.dataset.die = storedDie;
  wrap.dataset.label = label;

  // Die badge
  const badge = document.createElement("span");
  badge.className = "odd-die-badge";
  badge.textContent = die;
  wrap.appendChild(badge);

  // Roll to chat
  const rollBtn = document.createElement("a");
  rollBtn.className = "odd-pool-btn";
  rollBtn.dataset.action = "roll";
  rollBtn.title = `Roll ${die} to chat`;
  rollBtn.innerHTML = `<i class="fa-solid fa-dice-d20" inert></i>`;
  wrap.appendChild(rollBtn);

  // Add to pool as generic Bonus / Penalty
  const addGenericBtn = document.createElement("a");
  addGenericBtn.className = "odd-pool-btn";
  addGenericBtn.dataset.action = "add-generic";
  addGenericBtn.title = isPool ? `Add ${die} to pool as Bonus` : `Add ${die} to pool as Penalty`;
  addGenericBtn.innerHTML = isPool
    ? `<i class="fa-solid fa-plus" inert></i><span>B</span>`
    : `<i class="fa-solid fa-minus" inert></i><span>P</span>`;
  wrap.appendChild(addGenericBtn);

  // Add to pool with the named label (only when meaningful)
  if (isNamedLabel) {
    const addNamedBtn = document.createElement("a");
    addNamedBtn.className = "odd-pool-btn";
    addNamedBtn.dataset.action = "add-named";
    addNamedBtn.title = `Add ${die} to pool as "${label}"`;
    addNamedBtn.innerHTML = `<i class="fa-solid fa-tag" inert></i>`;
    wrap.appendChild(addNamedBtn);
  }

  return wrap;
}
