import { ActionCluster, InfoCluster, SegmentedProgressBar, TimerMetrics } from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface RunningBreakScreenProps {
  remainingMs: number;
  elapsedMs: number;
  breakMinutes: number;
  totalDurationMs: number;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  consecutiveWork: number;
  consecutiveBreaks: number;
  onRestart: () => void;
  onEdit: () => void;
}

export function RunningBreakScreen({
  remainingMs,
  elapsedMs,
  breakMinutes,
  totalDurationMs,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  consecutiveWork,
  consecutiveBreaks,
  onRestart,
  onEdit,
}: RunningBreakScreenProps): ReactNode {
  return (
    <div className="screen screen--timer">
      <div className="screen__top">
        <InfoCluster
          accent="break"
          showTimes={false}
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
          consecutiveWork={consecutiveWork}
          consecutiveBreaks={consecutiveBreaks}
          onEdit={onEdit}
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
