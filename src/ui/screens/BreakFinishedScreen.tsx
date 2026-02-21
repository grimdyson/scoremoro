import { ActionCluster, InfoCluster, SegmentedProgressBar, TimerMetrics } from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface BreakFinishedScreenProps {
  currentTime: string;
  finishTime: string;
  elapsedMs: number;
  breakMinutes: number;
  totalDurationMs: number;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  onRestart: () => void;
  onStopSound: () => void;
  /** Whether the alarm is currently audible */
  isSoundPlaying: boolean;
  /** Flash the 00:00 remaining text */
  flashRemaining?: boolean;
}

export function BreakFinishedScreen({
  currentTime,
  finishTime,
  elapsedMs,
  breakMinutes,
  totalDurationMs,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  onRestart,
  onStopSound,
  isSoundPlaying,
  flashRemaining = false,
}: BreakFinishedScreenProps): ReactNode {
  return (
    <div
      className={`screen screen--timer${isSoundPlaying ? ' screen--finished' : ''}`}
      onClick={onStopSound}
    >
      <div className="screen__top">
        <InfoCluster
          currentTime={currentTime}
          finishTime={finishTime}
          accent="break"
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
        >
          <ActionCluster showRestart onRestart={onRestart} />
        </InfoCluster>
      </div>

      <div className="screen__middle">
        <TimerMetrics remainingMs={0} elapsedMs={elapsedMs} accent="break" flash={flashRemaining} />
      </div>

      <div className="screen__bottom">
        <SegmentedProgressBar
          totalSegments={breakMinutes}
          remainingMs={0}
          totalDurationMs={totalDurationMs}
          accent="break"
          allDimmed
        />
      </div>
    </div>
  );
}
