import type { AccentMode } from '@core/types';
import { formatTimeParts } from '@core/types';
import type { ReactNode } from 'react';
import './TimerMetrics.css';

interface TimerMetricsProps {
  remainingMs: number;
  elapsedMs: number;
  accent: AccentMode;
  /** Flash the remaining time for 1 second when timer finishes */
  flash?: boolean;
}

export function TimerMetrics({
  remainingMs,
  elapsedMs,
  accent,
  flash = false,
}: TimerMetricsProps): ReactNode {
  const remaining = formatTimeParts(remainingMs);
  const elapsed = formatTimeParts(elapsedMs);

  return (
    <div className="timer-metrics">
      <div className="timer-metrics__column timer-metrics__column--left">
        <span className="timer-metrics__label">Remaining</span>
        <div
          className={`timer-metrics__time timer-metrics__time--white${flash ? ' timer-metrics__time--flash' : ''}`}
        >
          <span>{remaining.mm}</span>
          <span>:</span>
          <span>{remaining.ss}</span>
        </div>
      </div>
      <div className="timer-metrics__column timer-metrics__column--right">
        <span className="timer-metrics__label timer-metrics__label--muted">Elapsed</span>
        <div className="timer-metrics__time timer-metrics__time--muted">
          <span>{elapsed.mm}</span>
          <span>:</span>
          <span>{elapsed.ss}</span>
        </div>
      </div>
    </div>
  );
}
