import type { SelectionMode, TimerState } from '@core/types';
import { accentForState, isFinished, isIdle, isRunning } from '@core/types';
import { useTimerSound } from '@core/useTimerSound';
import { WindowFrame } from '@ui/components';
import {
  BreakFinishedScreen,
  IdleScreen,
  RunningBreakScreen,
  RunningWorkScreen,
  WorkFinishedScreen,
} from '@ui/screens';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import './App.css';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface AppState {
  timerState: TimerState;
  workMinutes: number;
  breakMinutes: number;
  selectionMode: SelectionMode;
  /** Epoch ms when the running timer will hit 0 */
  endTimestampMs: number;
  /** Frozen remaining ms (when paused) */
  remainingMs: number;
  /** Total configured duration ms for the active phase */
  totalDurationMs: number;
  /** Epoch ms when the timer finished (for continuing elapsed count) */
  finishedAtMs: number;
  isMuted: boolean;
  /** Work segments completed (full duration) */
  completedSegments: number;
  /** Break segments completed (full duration) */
  completedBreaks: number;
  /** Work segments started */
  startedWork: number;
  /** Break segments started */
  startedBreaks: number;
}

const INITIAL_STATE: AppState = {
  timerState: 'Idle',
  workMinutes: 25,
  breakMinutes: 5,
  selectionMode: 'Deselected',
  endTimestampMs: 0,
  remainingMs: 0,
  totalDurationMs: 0,
  finishedAtMs: 0,
  isMuted: false,
  completedSegments: 0,
  completedBreaks: 0,
  startedWork: 0,
  startedBreaks: 0,
};

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

type AppAction =
  | { type: 'SELECT_WORK' }
  | { type: 'SELECT_BREAK' }
  | { type: 'ADJUST_DURATION'; delta: number }
  | { type: 'START_POMODORO' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP_TO_BREAK' }
  | { type: 'START_BREAK' }
  | { type: 'RESTART' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE_MUTE' };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_WORK':
      return { ...state, selectionMode: 'WorkSelected' };

    case 'SELECT_BREAK':
      return { ...state, selectionMode: 'BreakSelected' };

    case 'ADJUST_DURATION': {
      if (state.selectionMode === 'BreakSelected') {
        return {
          ...state,
          breakMinutes: clamp(state.breakMinutes + action.delta, 1, 60),
          completedSegments: 0,
          completedBreaks: 0,
          startedWork: 0,
          startedBreaks: 0,
        };
      }
      // Default: adjust work (even if Deselected, auto-select work)
      return {
        ...state,
        selectionMode: 'WorkSelected',
        workMinutes: clamp(state.workMinutes + action.delta, 1, 180),
        completedSegments: 0,
        completedBreaks: 0,
        startedWork: 0,
        startedBreaks: 0,
      };
    }

    case 'START_POMODORO': {
      const durationMs = state.workMinutes * 60_000;
      return {
        ...state,
        timerState: 'RunningWork',
        selectionMode: 'Deselected',
        endTimestampMs: Date.now() + durationMs,
        totalDurationMs: durationMs,
        remainingMs: durationMs,
        startedWork: state.startedWork + 1,
      };
    }

    case 'TICK': {
      if (state.timerState === 'RunningWork') {
        const remaining = Math.max(0, state.endTimestampMs - Date.now());
        if (remaining <= 0) {
          return {
            ...state,
            timerState: 'WorkFinished',
            remainingMs: 0,
            finishedAtMs: Date.now(),
            completedSegments: state.completedSegments + 1,
          };
        }
        return { ...state, remainingMs: remaining };
      }
      if (state.timerState === 'RunningBreak') {
        const remaining = Math.max(0, state.endTimestampMs - Date.now());
        if (remaining <= 0) {
          return {
            ...state,
            timerState: 'BreakFinished',
            remainingMs: 0,
            finishedAtMs: Date.now(),
            completedBreaks: state.completedBreaks + 1,
          };
        }
        return { ...state, remainingMs: remaining };
      }
      // Finished states: force re-render so elapsed keeps ticking
      if (isFinished(state.timerState)) {
        return { ...state };
      }
      return state;
    }

    case 'PAUSE': {
      if (state.timerState === 'RunningWork') {
        return {
          ...state,
          timerState: 'PausedWork',
          remainingMs: Math.max(0, state.endTimestampMs - Date.now()),
        };
      }
      if (state.timerState === 'RunningBreak') {
        return {
          ...state,
          timerState: 'PausedBreak',
          remainingMs: Math.max(0, state.endTimestampMs - Date.now()),
        };
      }
      return state;
    }

    case 'RESUME': {
      if (state.timerState === 'PausedWork') {
        return {
          ...state,
          timerState: 'RunningWork',
          endTimestampMs: Date.now() + state.remainingMs,
        };
      }
      if (state.timerState === 'PausedBreak') {
        return {
          ...state,
          timerState: 'RunningBreak',
          endTimestampMs: Date.now() + state.remainingMs,
        };
      }
      return state;
    }

    case 'SKIP_TO_BREAK': {
      const durationMs = state.breakMinutes * 60_000;
      return {
        ...state,
        timerState: 'RunningBreak',
        endTimestampMs: Date.now() + durationMs,
        totalDurationMs: durationMs,
        remainingMs: durationMs,
        startedBreaks: state.startedBreaks + 1,
      };
    }

    case 'START_BREAK': {
      const durationMs = state.breakMinutes * 60_000;
      return {
        ...state,
        timerState: 'RunningBreak',
        endTimestampMs: Date.now() + durationMs,
        totalDurationMs: durationMs,
        remainingMs: durationMs,
        startedBreaks: state.startedBreaks + 1,
      };
    }

    case 'RESTART': {
      const durationMs = state.workMinutes * 60_000;
      return {
        ...state,
        timerState: 'RunningWork',
        selectionMode: 'Deselected',
        endTimestampMs: Date.now() + durationMs,
        totalDurationMs: durationMs,
        remainingMs: durationMs,
        startedWork: state.startedWork + 1,
      };
    }

    case 'CLOSE': {
      return {
        ...INITIAL_STATE,
        workMinutes: state.workMinutes,
        breakMinutes: state.breakMinutes,
        isMuted: state.isMuted,
        completedSegments: state.completedSegments,
        completedBreaks: state.completedBreaks,
        startedWork: state.startedWork,
        startedBreaks: state.startedBreaks,
      };
    }

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatClock(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function computeFinishTime(state: AppState): string {
  if (isIdle(state.timerState)) {
    const totalMinutes =
      state.selectionMode === 'BreakSelected'
        ? state.workMinutes + state.breakMinutes
        : state.workMinutes;
    const finish = new Date(Date.now() + totalMinutes * 60_000);
    return formatClock(finish);
  }

  if (isRunning(state.timerState)) {
    const finish = new Date(state.endTimestampMs);
    return formatClock(finish);
  }

  return formatClock(new Date());
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function App(): ReactNode {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Tick interval (running + finished states)
  useEffect(() => {
    if (!isRunning(state.timerState) && !isFinished(state.timerState)) return;

    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 250);

    return () => clearInterval(id);
  }, [state.timerState]);

  const currentTime = useMemo(() => formatClock(new Date()), [state.remainingMs]);
  const finishTime = useMemo(() => computeFinishTime(state), [state]);

  // Elapsed keeps counting past the timer end on finished screens
  const elapsedMs =
    isFinished(state.timerState) && state.finishedAtMs > 0
      ? state.totalDurationMs + (Date.now() - state.finishedAtMs)
      : Math.max(0, state.totalDurationMs - state.remainingMs);

  // Sound effect: auto-play (looped) when timer finishes, stop on leave
  const {
    play: playFinishSound,
    stop: stopFinishSound,
    isPlaying: isSoundPlaying,
  } = useTimerSound('./sounds/659889__blondpanda__short-elevator-music-loop.wav', {
    muted: state.isMuted,
  });
  const prevTimerState = useRef(state.timerState);
  const [flashRemaining, setFlashRemaining] = useState(false);

  useEffect(() => {
    const prev = prevTimerState.current;
    prevTimerState.current = state.timerState;

    // Fire sound + restore window when transitioning into a finished state
    if (isFinished(state.timerState) && !isFinished(prev)) {
      playFinishSound();
      (
        window as unknown as { electronAPI?: { restoreWindow: () => void } }
      ).electronAPI?.restoreWindow();

      // Flash 00:00 for 1 second
      setFlashRemaining(true);
      setTimeout(() => setFlashRemaining(false), 1000);
    }
    // Stop sound when leaving a finished state
    if (isFinished(prev) && !isFinished(state.timerState)) {
      stopFinishSound();
      setFlashRemaining(false);
    }
  }, [state.timerState, playFinishSound, stopFinishSound]);

  const handleClose = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const handleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const handleSkip = useCallback(() => dispatch({ type: 'SKIP_TO_BREAK' }), []);
  const handleRestart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const handleStart = useCallback(() => dispatch({ type: 'START_POMODORO' }), []);
  const handleSelectWork = useCallback(() => dispatch({ type: 'SELECT_WORK' }), []);
  const handleSelectBreak = useCallback(() => dispatch({ type: 'SELECT_BREAK' }), []);
  const handleDragDelta = useCallback(
    (delta: number) => dispatch({ type: 'ADJUST_DURATION', delta }),
    [],
  );
  const handleScrollDelta = useCallback(
    (delta: number) => dispatch({ type: 'ADJUST_DURATION', delta }),
    [],
  );

  switch (state.timerState) {
    case 'Idle':
      return (
        <div className="app">
          <WindowFrame isMuted={state.isMuted} onToggleMute={handleMute}>
            <IdleScreen
              currentTime={currentTime}
              finishTime={finishTime}
              workMinutes={state.workMinutes}
              breakMinutes={state.breakMinutes}
              selectionMode={state.selectionMode}
              completedWork={state.completedSegments}
              completedBreaks={state.completedBreaks}
              startedWork={state.startedWork}
              startedBreaks={state.startedBreaks}
              onSelectWork={handleSelectWork}
              onSelectBreak={handleSelectBreak}
              onStartPomodoro={handleStart}
              onRulerDragDelta={handleDragDelta}
              onRulerScrollDelta={handleScrollDelta}
            />
          </WindowFrame>
        </div>
      );

    case 'RunningWork':
    case 'PausedWork':
      return (
        <div className="app">
          <WindowFrame
            isMuted={state.isMuted}
            onToggleMute={handleMute}
            showEdit
            onEdit={handleClose}
          >
            <RunningWorkScreen
              currentTime={currentTime}
              finishTime={finishTime}
              remainingMs={state.remainingMs}
              elapsedMs={elapsedMs}
              workMinutes={state.workMinutes}
              totalDurationMs={state.totalDurationMs}
              completedWork={state.completedSegments}
              completedBreaks={state.completedBreaks}
              startedWork={state.startedWork}
              startedBreaks={state.startedBreaks}
              onSkip={handleSkip}
            />
          </WindowFrame>
        </div>
      );

    case 'WorkFinished':
      return (
        <div className="app">
          <WindowFrame
            isMuted={state.isMuted}
            onToggleMute={handleMute}
            showEdit
            onEdit={handleClose}
          >
            <WorkFinishedScreen
              currentTime={currentTime}
              finishTime={finishTime}
              elapsedMs={elapsedMs}
              workMinutes={state.workMinutes}
              totalDurationMs={state.totalDurationMs}
              completedWork={state.completedSegments}
              completedBreaks={state.completedBreaks}
              startedWork={state.startedWork}
              startedBreaks={state.startedBreaks}
              onSkip={handleSkip}
              onStopSound={stopFinishSound}
              isSoundPlaying={isSoundPlaying}
              flashRemaining={flashRemaining}
            />
          </WindowFrame>
        </div>
      );

    case 'RunningBreak':
    case 'PausedBreak':
      return (
        <div className="app">
          <WindowFrame
            isMuted={state.isMuted}
            onToggleMute={handleMute}
            showEdit
            onEdit={handleClose}
          >
            <RunningBreakScreen
              currentTime={currentTime}
              finishTime={finishTime}
              remainingMs={state.remainingMs}
              elapsedMs={elapsedMs}
              breakMinutes={state.breakMinutes}
              totalDurationMs={state.totalDurationMs}
              completedWork={state.completedSegments}
              completedBreaks={state.completedBreaks}
              startedWork={state.startedWork}
              startedBreaks={state.startedBreaks}
              onRestart={handleRestart}
            />
          </WindowFrame>
        </div>
      );

    case 'BreakFinished':
      return (
        <div className="app">
          <WindowFrame
            isMuted={state.isMuted}
            onToggleMute={handleMute}
            showEdit
            onEdit={handleClose}
          >
            <BreakFinishedScreen
              currentTime={currentTime}
              finishTime={finishTime}
              elapsedMs={elapsedMs}
              breakMinutes={state.breakMinutes}
              totalDurationMs={state.totalDurationMs}
              completedWork={state.completedSegments}
              completedBreaks={state.completedBreaks}
              startedWork={state.startedWork}
              startedBreaks={state.startedBreaks}
              onRestart={handleRestart}
              onStopSound={stopFinishSound}
              isSoundPlaying={isSoundPlaying}
              flashRemaining={flashRemaining}
            />
          </WindowFrame>
        </div>
      );

    default:
      return null;
  }
}
