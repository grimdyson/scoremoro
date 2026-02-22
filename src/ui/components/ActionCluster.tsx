import type { ReactNode } from 'react';
import { NextIcon, SkipIcon, RestartIcon } from './icons';
import './ActionCluster.css';

interface ActionClusterProps {
  /** Show "Skip >>" action (running work phase) */
  showSkip?: boolean;
  onSkip?: () => void;
  /** Show "Start Break >" action (work finished phase) */
  showStartBreak?: boolean;
  onStartBreak?: () => void;
  /** Show "Again" action with restart icon (break finished) */
  showRestart?: boolean;
  onRestart?: () => void;
}

export function ActionCluster({
  showSkip = false,
  onSkip,
  showStartBreak = false,
  onStartBreak,
  showRestart = false,
  onRestart,
}: ActionClusterProps): ReactNode {
  return (
    <div className="action-cluster" onClick={(e) => e.stopPropagation()}>
      {showRestart && (
        <button
          className="action-cluster__btn action-cluster__btn--restart"
          onClick={onRestart}
          type="button"
        >
          <span>Again</span>
          <RestartIcon size={20} />
        </button>
      )}

      {showSkip && (
        <button
          className="action-cluster__btn action-cluster__btn--skip"
          onClick={onSkip}
          type="button"
        >
          <span>Skip</span>
          <SkipIcon size={20} />
        </button>
      )}

      {showStartBreak && (
        <button
          className="action-cluster__btn action-cluster__btn--start-break"
          onClick={onStartBreak}
          type="button"
        >
          <span>Start Break</span>
          <NextIcon size={20} />
        </button>
      )}
    </div>
  );
}

/** Standalone CTA for Idle screen */
export function StartPomodoroCta({
  onClick,
}: {
  onClick: () => void;
}): ReactNode {
  return (
    <button
      className="action-cluster__btn action-cluster__btn--cta"
      onClick={onClick}
      type="button"
    >
      <span>Start Pomodoro</span>
      <NextIcon size={20} />
    </button>
  );
}
