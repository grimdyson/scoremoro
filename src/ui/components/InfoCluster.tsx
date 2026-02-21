import type { AccentMode } from '@core/types';
import type { ReactNode } from 'react';
import './InfoCluster.css';

interface InfoClusterProps {
  currentTime: string;
  finishTime: string;
  accent: AccentMode;
  /** Show the coloured divider bar (only on idle/selection screen) */
  showDivider?: boolean;
  /** Score data for the header score column */
  completedWork?: number;
  completedBreaks?: number;
  startedWork?: number;
  startedBreaks?: number;
  children?: ReactNode;
}

export function InfoCluster({
  currentTime,
  finishTime,
  accent,
  showDivider = false,
  completedWork = 0,
  completedBreaks = 0,
  startedWork = 0,
  startedBreaks = 0,
  children,
}: InfoClusterProps): ReactNode {
  const showScores = startedWork > 0 || startedBreaks > 0;
  const workPerfect = startedWork > 0 && completedWork === startedWork;
  const breakPerfect = startedBreaks > 0 && completedBreaks === startedBreaks;

  const accentClass = accent === 'break' ? ' info-cluster--break-accent' : '';

  const scoresClass = showScores ? ' info-cluster--has-scores' : '';

  return (
    <div className={`info-cluster${accentClass}${scoresClass}`}>
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

      {showDivider && <div className={`info-cluster__divider info-cluster__divider--${accent}`} />}

      {showScores && (
        <div className="info-cluster__scores">
          <div className="info-cluster__score-row">
            <span
              className={`info-cluster__score-count${workPerfect ? ' info-cluster__score-count--perfect' : ''}`}
            >
              {completedWork}/{startedWork}
            </span>
            <span className="info-cluster__score-label info-cluster__score-label--work">Work</span>
          </div>
          <div className="info-cluster__score-row">
            <span
              className={`info-cluster__score-count${breakPerfect ? ' info-cluster__score-count--perfect' : ''}`}
            >
              {completedBreaks}/{startedBreaks}
            </span>
            <span className="info-cluster__score-label info-cluster__score-label--break">
              Break
            </span>
          </div>
        </div>
      )}

      <div className="info-cluster__actions">{children}</div>
    </div>
  );
}
