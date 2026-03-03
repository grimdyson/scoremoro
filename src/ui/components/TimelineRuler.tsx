import type { SelectionMode } from '@core/types';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import './TimelineRuler.css';

interface TimelineRulerProps {
  /** Currently selected minute value */
  currentMinutes: number;
  /** Current ruler selection mode */
  selectionMode: SelectionMode;
  /** Whether the ruler is interactive (disabled during running) */
  disabled?: boolean;
  /** Called when the user drags to change the value */
  onDragDelta?: (deltaMinutes: number) => void;
  /** Called when the user scrolls to change the value */
  onScrollDelta?: (deltaMinutes: number) => void;
}

/**
 * One "period" of the repeating pattern.
 * Enough ticks that one copy is always wider than the viewport.
 * We render 3 copies and modular-wrap for infinite scroll.
 */
const PERIOD_TICKS = 200;

export function TimelineRuler({
  currentMinutes,
  selectionMode,
  disabled = false,
  onDragDelta,
  onScrollDelta,
}: TimelineRulerProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const measuredSlot = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragAccum = useRef(0);
  const [containerW, setContainerW] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const hideShort = false;

  /* --- Measure container width --- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* --- Measure tick slot width (tick + gap) after paint --- */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.children.length < 2) return;
    const a = strip.children[0] as HTMLElement;
    const b = strip.children[1] as HTMLElement;
    measuredSlot.current = b.getBoundingClientRect().left - a.getBoundingClientRect().left;
  }, [containerW, hideShort]);

  const slotW = measuredSlot.current ?? 6;

  /*
   * Infinite wrap: compute the raw offset that centres `currentMinutes`
   * under the viewport midpoint, then modular-wrap within one period
   * so the three copies always cover the full viewport.
   *
   * tickWidth / 2 (not slotW / 2) so we align the tick's visual centre
   * rather than the centre of the tick-plus-gap slot.
   */
  const tickWidth = 2; // matches --tick-width
  const periodPx = PERIOD_TICKS * slotW;
  const rawOffset = containerW / 2 - (currentMinutes - 1) * slotW - tickWidth / 2;
  const offset =
    periodPx > 0 ? Math.round((((rawOffset % periodPx) + periodPx) % periodPx) - periodPx) : Math.round(rawOffset);

  /**
   * Drag sensitivity: how many slot-widths of dragging equal 1 minute.
   * Higher = less sensitive (need to drag further per minute).
   */
  const dragSlotsPerMinute = 3;

  /* --- Pointer (drag) --- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      dragStartX.current = e.clientX;
      dragAccum.current = 0;
      setGrabbing(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragStartX.current === null || disabled) return;

      const dx = e.clientX - dragStartX.current;
      let step = 1;
      if (e.ctrlKey) step = 15;
      else if (e.shiftKey) step = 5;

      // Negate so drag-right = increase, divide by multiplier to reduce sensitivity
      const raw = -(dx / (slotW * dragSlotsPerMinute));
      const snapped = Math.trunc(raw / step) * step;

      if (snapped !== dragAccum.current) {
        const change = snapped - dragAccum.current;
        dragAccum.current = snapped;
        onDragDelta?.(change);
      }
    },
    [disabled, slotW, onDragDelta],
  );

  const handlePointerUp = useCallback(() => {
    dragStartX.current = null;
    dragAccum.current = 0;
    setGrabbing(false);
  }, []);

  /* --- Scroll --- */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      const dir = e.deltaY < 0 ? -1 : 1;
      let step = 1;
      if (e.ctrlKey) step = 15;
      else if (e.shiftKey) step = 5;
      onScrollDelta?.(dir * step);
    },
    [disabled, onScrollDelta],
  );

  /* --- Build class names for one period, rendered 3× for seamless wrap --- */
  const periodClasses: string[] = [];
  for (let i = 0; i < PERIOD_TICKS; i++) {
    const isLong = (i + 1) % 5 === 0;
    const hidden = hideShort && !isLong;
    periodClasses.push(
      [
        'timeline-ruler__tick',
        isLong ? 'timeline-ruler__tick--long' : 'timeline-ruler__tick--short',
        hidden ? 'timeline-ruler__tick--hidden' : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
  }

  // Three copies: [copy0][copy1][copy2] — modular offset keeps it centred
  const ticks: ReactNode[] = [];
  for (const prefix of ['a', 'b', 'c']) {
    for (let i = 0; i < PERIOD_TICKS; i++) {
      ticks.push(<div className={periodClasses[i]} key={`${prefix}${i}`} />);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`timeline-ruler${disabled ? ' timeline-ruler--disabled' : ''}${grabbing ? ' timeline-ruler--grabbing' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        ref={stripRef}
        className="timeline-ruler__strip"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {ticks}
      </div>
    </div>
  );
}
