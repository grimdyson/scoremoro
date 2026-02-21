/* ============================================================
   Scoremoro — Core Types
   ============================================================ */

/** Timer state machine states */
export type TimerState =
  | 'Idle'
  | 'RunningWork'
  | 'PausedWork'
  | 'WorkFinished'
  | 'RunningBreak'
  | 'PausedBreak'
  | 'BreakFinished';

/** Which duration the ruler is currently editing */
export type SelectionMode = 'Deselected' | 'WorkSelected' | 'BreakSelected';

/** The active colour accent derived from timer state / selection */
export type AccentMode = 'work' | 'break';

/** Snapshot of timer state exposed to UI */
export interface TimerSnapshot {
  state: TimerState;
  workMinutes: number;
  breakMinutes: number;
  remainingMs: number;
  elapsedMs: number;
  selectionMode: SelectionMode;
  isMuted: boolean;
}

/** Helpers to check accent / phase */
export function accentForState(state: TimerState, selection: SelectionMode): AccentMode {
  if (state === 'RunningBreak' || state === 'PausedBreak' || state === 'BreakFinished') {
    return 'break';
  }
  if (state === 'Idle' && selection === 'BreakSelected') {
    return 'break';
  }
  return 'work';
}

export function isRunning(state: TimerState): boolean {
  return state === 'RunningWork' || state === 'RunningBreak';
}

export function isFinished(state: TimerState): boolean {
  return state === 'WorkFinished' || state === 'BreakFinished';
}

export function isIdle(state: TimerState): boolean {
  return state === 'Idle';
}

export function isPaused(state: TimerState): boolean {
  return state === 'PausedWork' || state === 'PausedBreak';
}

export function isWorkPhase(state: TimerState): boolean {
  return state === 'RunningWork' || state === 'PausedWork' || state === 'WorkFinished';
}

export function isBreakPhase(state: TimerState): boolean {
  return state === 'RunningBreak' || state === 'PausedBreak' || state === 'BreakFinished';
}

/** Format milliseconds as MM:SS */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Format milliseconds as separate parts { mm, ss } */
export function formatTimeParts(ms: number): { mm: string; ss: string } {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
  };
}
