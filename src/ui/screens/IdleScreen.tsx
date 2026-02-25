import type { SelectionMode } from '@core/types';
import { accentForState } from '@core/types';
import {
  InfoCluster,
  ModeSelectorCard,
  ScoreCard,
  StartPomodoroCta,
  TimelineRuler,
} from '@ui/components';
import type { ReactNode } from 'react';
import './screens.css';

interface IdleScreenProps {
  currentTime: string;
  finishTime: string;
  workMinutes: number;
  breakMinutes: number;
  selectionMode: SelectionMode;
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  consecutiveWork: number;
  consecutiveBreaks: number;
  onSelectWork: () => void;
  onSelectBreak: () => void;
  onStartPomodoro: () => void;
  onRulerDragDelta: (delta: number) => void;
  onRulerScrollDelta: (delta: number) => void;
}

export function IdleScreen({
  currentTime,
  finishTime,
  workMinutes,
  breakMinutes,
  selectionMode,
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  consecutiveWork,
  consecutiveBreaks,
  onSelectWork,
  onSelectBreak,
  onStartPomodoro,
  onRulerDragDelta,
  onRulerScrollDelta,
}: IdleScreenProps): ReactNode {
  const accent = accentForState('Idle', selectionMode);

  // Total ticks = total minutes for the selected mode, or work by default
  const rulerMinutes = selectionMode === 'BreakSelected' ? breakMinutes : workMinutes;

  return (
    <div className="screen screen--idle">
      <div className="screen__top">
        <InfoCluster currentTime={currentTime} finishTime={finishTime} accent={accent} showDivider>
          <StartPomodoroCta onClick={onStartPomodoro} />
        </InfoCluster>

        <TimelineRuler
          currentMinutes={rulerMinutes}
          selectionMode={selectionMode}
          onDragDelta={onRulerDragDelta}
          onScrollDelta={onRulerScrollDelta}
        />
      </div>

      <div className="screen__bottom">
        <ModeSelectorCard
          mode="work"
          minutes={workMinutes}
          selectionMode={selectionMode}
          onClick={onSelectWork}
        />
        <ScoreCard
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
          consecutiveWork={consecutiveWork}
          consecutiveBreaks={consecutiveBreaks}
          variant="idle"
          activePhase="none"
        />
        <ModeSelectorCard
          mode="break"
          minutes={breakMinutes}
          selectionMode={selectionMode}
          onClick={onSelectBreak}
        />
      </div>
    </div>
  );
}
