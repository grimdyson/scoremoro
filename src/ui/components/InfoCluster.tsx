import type { AccentMode } from '@core/types';
import type { ReactNode } from 'react';
import { ExitIcon } from './icons';
import { ScoreCard } from './ScoreCard';
import './InfoCluster.css';

interface InfoClusterProps {
  currentTime?: string;
  finishTime?: string;
  accent: AccentMode;
  /** Show the current/finish time column (default true, false on timer screens) */
  showTimes?: boolean;
  /** Show the coloured divider bar (only on idle/selection screen) */
  showDivider?: boolean;
  /** Score data for the header score column */
  completedWork?: number;
  completedBreaks?: number;
  startedWork?: number;
  startedBreaks?: number;
  /** Called when the edit (pencil) icon is clicked (returns to idle) */
  onEdit?: () => void;
  /** Consecutive work completions (for streak) */
  consecutiveWork?: number;
  /** Consecutive break completions (for streak) */
  consecutiveBreaks?: number;
  children?: ReactNode;
}

export function InfoCluster({
  currentTime,
  finishTime,
  accent,
  showTimes = true,
  showDivider = false,
  completedWork = 0,
  completedBreaks = 0,
  startedWork = 0,
  startedBreaks = 0,
  onEdit,
  consecutiveWork = 0,
  consecutiveBreaks = 0,
  children,
}: InfoClusterProps): ReactNode {
  const showScores = startedWork > 0 || startedBreaks > 0;

  const accentClass = accent === 'break' ? ' info-cluster--break-accent' : '';

  const scoresClass = showScores ? ' info-cluster--has-scores' : '';

  return (
    <div className={`info-cluster${accentClass}${scoresClass}`}>
      {showTimes && (
        <div className="info-cluster__times">
          <div className="info-cluster__row">
            <span className="info-cluster__time-value">{currentTime}</span>
            <span className="info-cluster__time-label">Current</span>
          </div>
          <div className="info-cluster__row">
            <span className={`info-cluster__time-value info-cluster__time-value--accent-${accent}`}>
              {finishTime}
            </span>
            <span className="info-cluster__time-label">Finish</span>
          </div>
        </div>
      )}

      {showDivider && <div className={`info-cluster__divider info-cluster__divider--${accent}`} />}

      {showScores && (
        <ScoreCard
          completedWork={completedWork}
          completedBreaks={completedBreaks}
          startedWork={startedWork}
          startedBreaks={startedBreaks}
          variant="timer"
          activePhase={accent === 'break' ? 'break' : 'work'}
          consecutiveWork={consecutiveWork}
          consecutiveBreaks={consecutiveBreaks}
        />
      )}

      {showScores && onEdit && (
        <button
          className="info-cluster__edit"
          onClick={onEdit}
          type="button"
          aria-label="Exit to idle"
        >
          <ExitIcon size={20} />
        </button>
      )}

      <div className="info-cluster__actions">{children}</div>
    </div>
  );
}
