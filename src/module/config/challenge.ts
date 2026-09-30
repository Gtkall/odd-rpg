/** ODDEasy Extended Tests (Progress Bars) and Challenge Tests (Goals, Timers, Danger). */

export interface TaskLengthDef {
  label: string;
  /** Segments on the task's Progress Bar. */
  segments: number;
}

export type TaskLengthKey = "short" | "moderate" | "long";

export const TASK_LENGTHS: Readonly<Record<TaskLengthKey, TaskLengthDef>> = Object.freeze({
  short:    { label: "ODD.Challenge.Length.short",    segments: 4 },
  moderate: { label: "ODD.Challenge.Length.moderate", segments: 6 },
  long:     { label: "ODD.Challenge.Length.long",     segments: 8 },
});

export const DEFAULT_TASK_LENGTH: TaskLengthKey = "moderate";

/** Failures an Extended Test can take; this many are a Botch. */
export const EXTENDED_TEST_MAX_FAILURES = 3;

export interface DangerLevelDef {
  label: string;
  /** Power of the Hit suffered when attempting to Resolve the Goal. */
  power: number;
}

export type DangerLevelKey = "veryLow" | "low" | "medium" | "high" | "veryHigh";

export const DANGER_LEVELS: Readonly<Record<DangerLevelKey, DangerLevelDef>> = Object.freeze({
  veryLow:  { label: "ODD.Challenge.Danger.veryLow",  power: 0 },
  low:      { label: "ODD.Challenge.Danger.low",      power: 5 },
  medium:   { label: "ODD.Challenge.Danger.medium",   power: 10 },
  high:     { label: "ODD.Challenge.Danger.high",     power: 15 },
  veryHigh: { label: "ODD.Challenge.Danger.veryHigh", power: 20 },
});
