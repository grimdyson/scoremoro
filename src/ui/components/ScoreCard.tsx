import type { ReactNode } from 'react';
import './ScoreCard.css';

interface ScoreCardProps {
  completedWork: number;
  completedBreaks: number;
  startedWork: number;
  startedBreaks: number;
  /** Visual variant — timer uses yellow for work, idle uses white for both */
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

  // Numerator stays green when the score *was* perfect before the current segment
  const workNumeratorGreen = !workPerfect && completedWork > 0 && completedWork === startedWork - 1;
  const breakNumeratorGreen =
    !breakPerfect && completedBreaks > 0 && completedBreaks === startedBreaks - 1;

  return (
    <div className={`score-card score-card--${variant}`}>
      {variant === 'idle' && <span className="score-card__title">Session Score</span>}
      <div className="score-card__row">
        <span
          className={`score-card__count score-card__count--work${workPerfect ? ' score-card__count--perfect' : ''}`}
        >
          <span className={workNumeratorGreen ? 'score-card__numerator--green' : ''}>
            {completedWork}
          </span>
          <span className="score-card__slash">/</span>
          <span>{startedWork}</span>
        </span>
        <span className="score-card__label score-card__label--work">Work</span>
      </div>
      <div className="score-card__row">
        <span
          className={`score-card__count score-card__count--break${breakPerfect ? ' score-card__count--perfect' : ''}`}
        >
          <span className={breakNumeratorGreen ? 'score-card__numerator--green' : ''}>
            {completedBreaks}
          </span>
          <span className="score-card__slash">/</span>
          <span>{startedBreaks}</span>
        </span>
        <span className="score-card__label score-card__label--break">Break</span>
      </div>
    </div>
  );
}
