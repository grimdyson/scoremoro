import { ActionCluster, InfoCluster, SegmentedProgressBar, TimerMetrics } from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface WorkFinishedScreenProps {
  elapsedMs: number;
  workMinutes: number;
  totalDurationMs: number;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  onSkip: () => void;
  onStopSound: () => void;
  /** Whether the alarm is currently audible */
  isSoundPlaying: boolean;
  /** Flash the 00:00 remaining text */
  flashRemaining?: boolean;
}

export function WorkFinishedScreen({
  elapsedMs,
  workMinutes,
  totalDurationMs,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  onSkip,
  onStopSound,
  isSoundPlaying,
  flashRemaining = false,
}: WorkFinishedScreenProps): ReactNode {
  return (
    <div
      className={`screen screen--timer${isSoundPlaying ? ' screen--finished' : ''}`}
      onClick={onStopSound}
    >
      <div className="screen__top">
        <InfoCluster
          accent="work"
          showTimes={false}
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
        >
          <ActionCluster showSkip onSkip={onSkip} />
        </InfoCluster>
      </div>

      <div className="screen__middle">
        <TimerMetrics remainingMs={0} elapsedMs={elapsedMs} accent="work" flash={flashRemaining} />
      </div>

      <div className="screen__bottom">
        <SegmentedProgressBar
          totalSegments={workMinutes}
          remainingMs={0}
          totalDurationMs={totalDurationMs}
          accent="work"
          allDimmed
        />
      </div>
    </div>
  );
}
