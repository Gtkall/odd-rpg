/**
 * OddChallengeTracker — Floating singleton ApplicationV2.
 *
 * The table's Progress Bars and Goals for Extended and Challenge Tests, kept
 * in a world setting so every client shows the same state. The GM edits it;
 * players only watch. It records what the GM marks and never judges a roll.
 *
 *   - Primary Goal   : an Extended Test — a Progress Bar of 4/6/8 Segments and
 *                      three Failure pips. A lone Extended Test is one such Goal.
 *   - Secondary Goal : a Standard or Opposed Test — marked succeeded or failed.
 *   - Turn / Timer   : the current Turn, and the Turn the Timer runs out on.
 */

import {
  DANGER_LEVELS,
  DEFAULT_TASK_LENGTH,
  EXTENDED_TEST_MAX_FAILURES,
  TASK_LENGTHS,
  type DangerLevelKey,
} from "../config/challenge.js";

export type GoalOutcome = "" | "success" | "failure";

export interface ChallengeGoal {
  id: string;
  name: string;
  /** Primary Goals are Extended Tests; Secondary Goals resolve in one roll. */
  primary: boolean;
  /** Free text: a Difficulty Threshold ("15") or an opposing Dice Pool ("4d10"). */
  dt: string;
  danger: DangerLevelKey | "";
  segments: number;
  filled: number;
  failures: number;
  /** How a Secondary Goal's one roll went. A Primary Goal's outcome shows on its bar and pips. */
  outcome: GoalOutcome;
}

// A type alias, not an interface: fvtt-types only accepts an object-typed
// setting that is assignable to an index signature.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ChallengeState = {
  turn: number;
  /** The Turn the Timer runs out at the end of; 0 for no Timer. */
  timer: number;
  goals: ChallengeGoal[];
};

export const DEFAULT_CHALLENGE_STATE: ChallengeState = Object.freeze({ turn: 1, timer: 0, goals: [] });

async function updateChallenge(mutate: (state: ChallengeState) => void): Promise<void> {
  const state = foundry.utils.deepClone(game.settings.get("odd-rpg", "challenge"));
  mutate(state);
  await game.settings.set("odd-rpg", "challenge", state);
}

function goalOf(state: ChallengeState, target: HTMLElement): ChallengeGoal | undefined {
  const id = target.closest<HTMLElement>("[data-goal-id]")?.dataset.goalId;
  return state.goals.find((g) => g.id === id);
}

/** Clicking the last marked cell unmarks it; any other cell marks up to it. */
function toggleUpTo(current: number, clicked: number): number {
  return current === clicked ? clicked - 1 : clicked;
}

/** A Primary Goal succeeds on a full Progress Bar and is Botched by its last Failure. */
function goalOutcome(goal: ChallengeGoal): GoalOutcome {
  if (!goal.primary) return goal.outcome;
  if (goal.filled >= goal.segments) return "success";
  return goal.failures >= EXTENDED_TEST_MAX_FAILURES ? "failure" : "";
}

interface GoalDetail {
  /** Font Awesome classes of the icon shown before the text. */
  icon: string;
  text: string;
}

/** A Goal's facts as one line for players: what to beat, the Danger, the Progress so far. */
function goalDetails(goal: ChallengeGoal): GoalDetail[] {
  const details: GoalDetail[] = [];
  if (goal.dt) {
    // A Dice Pool ("4d10") instead of a number means the Goal is an Opposed Test.
    const key = /\dd\d/i.test(goal.dt) ? "ODD.Challenge.opposedValue" : "ODD.Challenge.dtValue";
    details.push({ icon: "fa-solid fa-dice-d20", text: game.i18n.format(key, { dt: goal.dt }) });
  }
  if (goal.danger) {
    const danger = DANGER_LEVELS[goal.danger];
    details.push({
      icon: "fa-solid fa-skull-crossbones odd-goal-fact-danger",
      text: game.i18n.format("ODD.Challenge.dangerValue", {
        label: game.i18n.localize(danger.label),
        power: String(danger.power),
      }),
    });
  }
  if (goal.primary) {
    details.push({
      icon: "fa-solid fa-bars-progress",
      text: game.i18n.format("ODD.Challenge.progressValue", {
        filled: String(goal.filled),
        segments: String(goal.segments),
      }),
    });
  }
  return details;
}

/** Cells 1..count for a bar or pip row, the first `marked` of them filled. */
function cells(count: number, marked: number): { value: number; filled: boolean }[] {
  return Array.from({ length: count }, (_, i) => ({ value: i + 1, filled: i < marked }));
}

// ---- Actions (GM only: the template gives players no enabled controls) ----

async function onAddGoal(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    state.goals.push({
      id: foundry.utils.randomID(),
      name: "",
      primary: target.dataset.primary === "true",
      dt: "",
      danger: "",
      segments: TASK_LENGTHS[DEFAULT_TASK_LENGTH].segments,
      filled: 0,
      failures: 0,
      outcome: "",
    });
  });
}

async function onRemoveGoal(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    const goal = goalOf(state, target);
    state.goals = state.goals.filter((g) => g !== goal);
  });
}

async function onSetProgress(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    const goal = goalOf(state, target);
    if (goal) goal.filled = toggleUpTo(goal.filled, Number(target.dataset.value));
  });
}

async function onSetFailures(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    const goal = goalOf(state, target);
    if (goal) goal.failures = toggleUpTo(goal.failures, Number(target.dataset.value));
  });
}

async function onSetOutcome(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    const goal = goalOf(state, target);
    const outcome = target.dataset.outcome as GoalOutcome;
    if (goal) goal.outcome = goal.outcome === outcome ? "" : outcome;
  });
}

async function onChangeTurn(_event: PointerEvent, target: HTMLElement): Promise<void> {
  await updateChallenge((state) => {
    state.turn = Math.max(1, state.turn + Number(target.dataset.delta));
  });
}

function onTogglePreview(this: OddChallengeTracker): void {
  this.togglePreview();
}

async function onReset(): Promise<void> {
  const confirmed = await DialogV2.confirm({
    window: { title: "ODD.Challenge.reset" },
    content: `<p>${game.i18n.localize("ODD.Challenge.resetConfirm")}</p>`,
  });
  if (confirmed) await game.settings.set("odd-rpg", "challenge", foundry.utils.deepClone(DEFAULT_CHALLENGE_STATE));
}

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Opening width for the GM, so a Goal's controls fit on one line. */
const GM_WIDTH = 700;

export class OddChallengeTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static override readonly DEFAULT_OPTIONS = {
    id: "odd-challenge-tracker",
    classes: ["odd-rpg", "odd-challenge-tracker"],
    tag: "div",
    window: {
      title: "ODD.Challenge.title",
      resizable: true,
    },
    position: {
      width: 560,
      height: 520,
    },
    actions: {
      addGoal: onAddGoal,
      removeGoal: onRemoveGoal,
      setProgress: onSetProgress,
      setFailures: onSetFailures,
      setOutcome: onSetOutcome,
      changeTurn: onChangeTurn,
      togglePreview: onTogglePreview,
      reset: onReset,
    },
  };

  static override readonly PARTS = {
    tracker: {
      template: "systems/odd-rpg/templates/tracker/challenge-tracker.hbs",
    },
  };

  // Private mutable singleton ref — cannot be readonly
  // eslint-disable-next-line sonarjs/public-static-readonly
  static #instance: OddChallengeTracker | null = null;

  static get instance(): OddChallengeTracker {
    // The GM's rows of controls need more room than the players' text.
    OddChallengeTracker.#instance ??= new OddChallengeTracker(game.user.isGM ? { position: { width: GM_WIDTH } } : {});
    return OddChallengeTracker.#instance;
  }

  /** The GM is looking at the read-only view the players get. */
  #preview = false;

  togglePreview(): void {
    this.#preview = !this.#preview;
    void this.render();
  }

  // Foundry requires async; all data is synchronous so no await is needed here
  // eslint-disable-next-line @typescript-eslint/require-await
  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const state = game.settings.get("odd-rpg", "challenge");
    const editable = game.user.isGM && !this.#preview;

    const lengthOptions = Object.fromEntries(Object.values(TASK_LENGTHS).map((def) =>
      [def.segments, `${game.i18n.localize(def.label)} (${def.segments})`]));
    const dangerOptions = Object.fromEntries(Object.entries(DANGER_LEVELS).map(([key, def]) =>
      [key, `${game.i18n.localize(def.label)} (+${def.power})`]));

    const rows = state.goals.map((goal) => {
      const outcome = goalOutcome(goal);
      return {
        ...goal,
        succeeded: outcome === "success",
        failed: outcome === "failure",
        details: goalDetails(goal),
        segmentCells: cells(goal.segments, goal.filled),
        failurePips: cells(EXTENDED_TEST_MAX_FAILURES, goal.failures),
      };
    });

    return {
      ...context,
      isGM: editable,
      locked: !editable,
      canPreview: game.user.isGM,
      preview: this.#preview,
      turn: state.turn,
      timer: state.timer,
      lastTurn: state.timer > 0 && state.turn >= state.timer,
      primaryGoals: rows.filter((g) => g.primary),
      secondaryGoals: rows.filter((g) => !g.primary),
      lengthOptions,
      dangerOptions,
    };
  }

  override async _onRender(_context: any, _options: any) {
    await super._onRender(_context, _options);
    for (const el of this.element.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]")) {
      el.addEventListener("change", () => { void this._onFieldChange(el); });
    }
  }

  private async _onFieldChange(el: HTMLInputElement | HTMLSelectElement): Promise<void> {
    const field = el.dataset.field;
    await updateChallenge((state) => {
      if (field === "timer") {
        state.timer = Math.max(0, Math.trunc(Number(el.value)) || 0);
        return;
      }
      const goal = goalOf(state, el);
      if (!goal) return;
      if (field === "name") goal.name = el.value;
      else if (field === "dt") goal.dt = el.value;
      else if (field === "danger") goal.danger = el.value as DangerLevelKey | "";
      else if (field === "segments") {
        goal.segments = Number(el.value);
        goal.filled = Math.min(goal.filled, goal.segments);
      }
    });
  }
}
