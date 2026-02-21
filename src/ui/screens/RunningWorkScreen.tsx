import { ActionCluster, InfoCluster, SegmentedProgressBar, TimerMetrics } from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface RunningWorkScreenProps {
  currentTime: string;
  finishTime: string;
  remainingMs: number;
  elapsedMs: number;
  workMinutes: number;
  totalDurationMs: number;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  onSkip: () => void;
}

export function RunningWorkScreen({
  currentTime,
  finishTime,
  remainingMs,
  elapsedMs,
  workMinutes,
  totalDurationMs,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  onSkip,
}: RunningWorkScreenProps): ReactNode {
  return (
    <div className="screen screen--timer">
      <div className="screen__top">
        <InfoCluster
          currentTime={currentTime}
          finishTime={finishTime}
          accent="work"
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
        >
          <ActionCluster showSkip onSkip={onSkip} />
        </InfoCluster>
      </div>

      <div className="screen__middle">
        <TimerMetrics remainingMs={remainingMs} elapsedMs={elapsedMs} accent="work" />
      </div>

      <div className="screen__bottom">
        <SegmentedProgressBar
          totalSegments={workMinutes}
          remainingMs={remainingMs}
          totalDurationMs={totalDurationMs}
          accent="work"
        />
      </div>
    </div>
  );
}
