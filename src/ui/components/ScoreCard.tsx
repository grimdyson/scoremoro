import type { ReactNode } from 'react';
import { FireIcon } from './icons';
import './ScoreCard.css';

interface ScoreCardProps {
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  /** Visual variant — idle shows title above, timer is inline */
  variant?: 'timer' | 'idle';
  /** Which phase is currently in-progress (allows streak grace for the active leg) */
  activePhase?: 'work' | 'break' | 'none';
  /** Consecutive work completions without skip/exit */
  consecutiveWork?: number;
  /** Consecutive break completions without skip/exit */
  consecutiveBreaks?: number;
}

export function ScoreCard({
  completedWork,
  completedBreaks,
  startedWork,
  startedBreaks,
  variant = 'timer',
  activePhase = 'none',
  consecutiveWork = 0,
  consecutiveBreaks = 0,
}: ScoreCardProps): ReactNode {
  // Streak fires when the user has 2+ consecutive completions.
  const workPerfect = consecutiveWork >= 2;
  const breakPerfect = consecutiveBreaks >= 2;

  return (
    <div className={`score-card score-card--${variant}`}>
      {variant === 'idle' && <span className="score-card__title">Session Score</span>}
      <div className="score-card__badges">
        <div className={`score-badge score-badge--${workPerfect ? 'streak' : 'work'}`}>
          {workPerfect && <FireIcon size={12} className="score-badge__fire" />}
          <span className="score-badge__count">
            {completedWork}/{startedWork}
          </span>
          <span className="score-badge__label">Work</span>
        </div>
        <div className={`score-badge score-badge--${breakPerfect ? 'streak' : 'break'}`}>
          {breakPerfect && <FireIcon size={12} className="score-badge__fire" />}
          <span className="score-badge__count">
            {completedBreaks}/{startedBreaks}
          </span>
          <span className="score-badge__label">Break</span>
        </div>
      </div>
    </div>
  );
}
