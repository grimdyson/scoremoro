import type { ReactNode } from 'react';
import { ChevronRightIcon, RestartIcon } from './icons';
import './ActionCluster.css';

interface ActionClusterProps {
  /** Show "Break >>" action (work phase) */
  showSkip?: boolean;
  onSkip?: () => void;
  /** Show "Again" action with restart icon (break finished) */
  showRestart?: boolean;
  onRestart?: () => void;
}

export function ActionCluster({
  showSkip = false,
  onSkip,
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
          <span>Break</span>
          <ChevronRightIcon size={20} />
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
      Start Pomodoro
    </button>
  );
}
