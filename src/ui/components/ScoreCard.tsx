import type { ReactNode } from 'react';
import './ScoreCard.css';

interface ScoreCardProps {
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  /** Visual variant — idle shows title above, timer is inline */
  variant?: 'timer' | 'idle';
}

export function ScoreCard({
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  variant = 'timer',
}: ScoreCardProps): ReactNode {
  const workPerfect = startedWork > 0 && completedWork === startedWork;
  const breakPerfect = startedBreaks > 0 && completedBreaks === startedBreaks;

  return (
    <div className={`score-card score-card--${variant}`}>
      {variant === 'idle' && <span className="score-card__title">Session Score</span>}
      <div className="score-card__badges">
        <div className={`score-badge score-badge--${workPerfect ? 'streak' : 'work'}`}>
          <span className="score-badge__count">
            {completedWork}/{startedWork}
          </span>
          <span className="score-badge__label">Work</span>
        </div>
        <div className={`score-badge score-badge--${breakPerfect ? 'streak' : 'break'}`}>
          <span className="score-badge__count">
            {completedBreaks}/{startedBreaks}
          </span>
          <span className="score-badge__label">Break</span>
        </div>
      </div>
    </div>
  );
}
