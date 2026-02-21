import { ActionCluster, InfoCluster, SegmentedProgressBar, TimerMetrics } from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface RunningBreakScreenProps {
  currentTime: string;
  finishTime: string;
  remainingMs: number;
  elapsedMs: number;
  breakMinutes: number;
  totalDurationMs: number;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  onRestart: () => void;
}

export function RunningBreakScreen({
  currentTime,
  finishTime,
  remainingMs,
  elapsedMs,
  breakMinutes,
  totalDurationMs,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  onRestart,
}: RunningBreakScreenProps): ReactNode {
  return (
    <div className="screen screen--timer">
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
        <TimerMetrics remainingMs={remainingMs} elapsedMs={elapsedMs} accent="break" />
      </div>

      <div className="screen__bottom">
        <SegmentedProgressBar
          totalSegments={breakMinutes}
          remainingMs={remainingMs}
          totalDurationMs={totalDurationMs}
          accent="break"
        />
      </div>
    </div>
  );
}
