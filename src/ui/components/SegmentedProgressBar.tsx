import type { AccentMode } from '@core/types';
import type { ReactNode } from 'react';
import './SegmentedProgressBar.css';

interface SegmentedProgressBarProps {
  /** Total number of segments (= total minutes) */
  totalSegments: number;
  /** Milliseconds remaining in the current phase */
  remainingMs: number;
  /** Total milliseconds for the current phase */
  totalDurationMs: number;
  /** Colour accent */
  accent: AccentMode;
  /** Whether all segments are dimmed (finished state) */
  allDimmed?: boolean;
}

type SlabState = 'filled' | 'dimmed' | 'flashing';

/**
 * Determine the visual state of a single 30-second slab.
 *
 * The bar starts fully filled and *depletes*:
 *  - elapsed < slabStart  → filled  (time hasn't reached this slab yet → still full)
 *  - elapsed ≥ slabEnd    → dimmed  (slab fully consumed)
 *  - in-between           → the slab is actively draining.
 *    If ≤ 5 s remain in the slab → flash.
 *    Otherwise → filled (still has time).
 */
function getSlabState(
  elapsedSec: number,
  slabStartSec: number,
  slabEndSec: number,
  allDimmed: boolean,
): SlabState {
  if (allDimmed) return 'dimmed';
  if (elapsedSec >= slabEndSec) return 'dimmed';
  if (elapsedSec < slabStartSec) return 'filled';
  const remaining = slabEndSec - elapsedSec;
  return remaining <= 5 ? 'flashing' : 'filled';
}

function slabClassName(state: SlabState, accent: AccentMode): string {
  const base = 'progress-bar__slab';
  switch (state) {
    case 'filled':
      return `${base} ${base}--${accent}-filled`;
    case 'dimmed':
      return `${base} ${base}--${accent}-dimmed`;
    case 'flashing':
      return `${base} ${base}--${accent}-flashing`;
  }
}

export function SegmentedProgressBar({
  totalSegments,
  remainingMs,
  totalDurationMs,
  accent,
  allDimmed = false,
}: SegmentedProgressBarProps): ReactNode {
  const elapsedSec = Math.max(0, totalDurationMs - remainingMs) / 1000;

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const minuteStart = i * 60;

    const topStart = minuteStart;
    const topEnd = minuteStart + 30;
    const bottomStart = minuteStart + 30;
    const bottomEnd = minuteStart + 60;

    const topState = getSlabState(elapsedSec, topStart, topEnd, allDimmed);
    const bottomState = getSlabState(elapsedSec, bottomStart, bottomEnd, allDimmed);

    return (
      <div className="progress-bar__segment" key={i}>
        <div className={slabClassName(topState, accent)} />
        <div className={slabClassName(bottomState, accent)} />
      </div>
    );
  });

  return <div className="progress-bar">{segments}</div>;
}
