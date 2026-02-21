import type { SelectionMode } from '@core/types';
import type { ReactNode } from 'react';
import './ModeSelectorCard.css';

interface ModeSelectorCardProps {
  mode: 'work' | 'break';
  minutes: number;
  selectionMode: SelectionMode;
  onClick: () => void;
}

export function ModeSelectorCard({
  mode,
  minutes,
  selectionMode,
  onClick,
}: ModeSelectorCardProps): ReactNode {
  const isWork = mode === 'work';
  const label = isWork ? 'Work' : 'Break';

  let borderClass: string;
  if (isWork) {
    borderClass =
      selectionMode === 'WorkSelected' || selectionMode === 'Deselected'
        ? 'mode-card--work-selected'
        : 'mode-card--work-deselected';
  } else {
    borderClass =
      selectionMode === 'BreakSelected'
        ? 'mode-card--break-selected'
        : 'mode-card--break-deselected';
  }

  const alignClass = isWork ? 'mode-card--left' : 'mode-card--right';

  return (
    <button className={`mode-card ${alignClass} ${borderClass}`} onClick={onClick} type="button">
      <span className="mode-card__label">{label}</span>
      <span
        className={`mode-card__value ${
          isWork ? 'mode-card__value--work' : 'mode-card__value--break'
        }`}
      >
        {String(minutes).padStart(2, '0')}
      </span>
    </button>
  );
}
