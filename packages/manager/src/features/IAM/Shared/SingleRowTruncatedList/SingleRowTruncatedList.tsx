import React from 'react';

import styles from './SingleRowTruncatedList.module.css';

/**
 * SingleRowTruncatedList
 *
 * Width-based truncation for single-row, nowrap flex contexts (e.g. CDS table cells).
 * Renders all items in the DOM but hides overflowing ones via `display:none`, driving
 * visibility through React state so it never conflicts with reconciliation.
 *
 * Designed for use alongside the height-based TruncatedList (which handles flex-wrap
 * multi-row contexts like Permissions). The two are intentionally separate.
 *
 * Props:
 * - items: pre-rendered ReactNode array to display as chips/tags
 * - totalCount: true total (may exceed items.length when the caller caps rendering)
 * - gapPx: pixel gap between items (default 8)
 * - ellipsisReservePx: fallback pixels reserved for the ellipsis when measurement is
 *   unavailable (default 20)
 * - ellipsisText: separator shown before the overflow pill (default "...")
 * - renderOverflowButton: render prop for the +N pill; receives hidden item count
 * - overflowButtonPhantom: render prop for the phantom (off-screen) overflow pill used
 *   to pre-measure the pill width before layout. Must render the pill at its maximum
 *   possible width (e.g. use the largest plausible count).
 */

export interface SingleRowTruncatedListProps {
  ellipsisReservePx?: number;
  ellipsisText?: string;
  gapPx?: number;
  items: React.ReactNode[];
  overflowButtonPhantom: React.ReactNode;
  renderOverflowButton: (hiddenCount: number) => React.ReactNode;
  totalCount?: number;
}

export const SingleRowTruncatedList = ({
  ellipsisReservePx = 20,
  ellipsisText = '...',
  gapPx = 8,
  items,
  overflowButtonPhantom,
  renderOverflowButton,
  totalCount,
}: SingleRowTruncatedListProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const overflowMeasureRef = React.useRef<HTMLDivElement>(null);
  const ellipsisMeasureRef = React.useRef<HTMLSpanElement>(null);

  const effectiveTotalCount = totalCount ?? items.length;
  const [visibleCount, setVisibleCount] = React.useState(items.length);

  const recalculate = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || container.clientWidth === 0) {
      return;
    }

    const itemEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-slrtl-item]')
    );

    if (itemEls.length === 0) {
      setVisibleCount(0);
      return;
    }

    // Read each item's width by briefly making it inline-flex so display:none
    // items still contribute their natural width to the measurement.
    const itemWidths = itemEls.map((el) => {
      const prev = el.style.display;
      el.style.display = 'inline-flex';
      const width = el.offsetWidth;
      el.style.display = prev;

      return width;
    });

    const overflowWidth = overflowMeasureRef.current?.offsetWidth ?? 48;
    const ellipsisWidth =
      ellipsisMeasureRef.current?.offsetWidth ?? ellipsisReservePx;
    const availableWidth = container.clientWidth;

    const allItemsWidth = itemWidths.reduce(
      (sum, w, i) => sum + w + (i > 0 ? gapPx : 0),
      0
    );

    // All items fit and no hidden-by-cap items — no overflow needed
    if (
      allItemsWidth <= availableWidth &&
      effectiveTotalCount <= items.length
    ) {
      setVisibleCount(itemWidths.length);
      return;
    }

    // Find the largest K where K items + ellipsis + overflow pill fit
    let count = 0;
    let usedWidth = 0;

    for (const itemWidth of itemWidths) {
      const gap = count > 0 ? gapPx : 0;
      const nextUsedWidth = usedWidth + gap + itemWidth;
      const widthWithOverflow =
        nextUsedWidth + gapPx + ellipsisWidth + gapPx + overflowWidth;

      if (widthWithOverflow > availableWidth) {
        break;
      }

      usedWidth = nextUsedWidth;
      count++;
    }

    setVisibleCount(count);
  }, [gapPx, ellipsisReservePx, items.length, effectiveTotalCount]);

  React.useLayoutEffect(() => {
    recalculate();

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // CDS web components, fonts, and percentage-based table columns may not be
    // settled on the first layout pass. Re-measure after paint and when fonts load.
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(recalculate);
    });

    let cancelled = false;
    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      fontsReady.then(() => {
        if (!cancelled) {
          recalculate();
        }
      });
    }

    const containerObserver = new ResizeObserver(recalculate);
    containerObserver.observe(container);

    const itemObserver = new ResizeObserver(recalculate);
    container
      .querySelectorAll<HTMLElement>('[data-slrtl-item]')
      .forEach((el) => {
        itemObserver.observe(el);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      containerObserver.disconnect();
      itemObserver.disconnect();
    };
  }, [recalculate, items, ellipsisText]);

  const hiddenFromTruncate = Math.max(0, items.length - visibleCount);
  const hiddenFromCap = Math.max(0, effectiveTotalCount - items.length);
  const numHiddenItems = hiddenFromTruncate + hiddenFromCap;
  const showOverflow = numHiddenItems > 0;

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Phantom pill — absolutely positioned, invisible, used only to measure overflow pill width */}
      <div aria-hidden className={styles.phantom} ref={overflowMeasureRef}>
        {overflowButtonPhantom}
        <span className={styles.ellipsisMeasure} ref={ellipsisMeasureRef}>
          {ellipsisText}
        </span>
      </div>

      {/* Item strip */}
      <div className={styles.itemStrip} style={{ gap: `${gapPx}px` }}>
        {items.map((item, index) => (
          <div
            className={styles.item}
            data-slrtl-item
            key={`pill-${index}`}
            style={{ display: index < visibleCount ? 'inline-flex' : 'none' }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Ellipsis separator */}
      {showOverflow && (
        <span
          className={styles.ellipsis}
          data-slrtl-visible-ellipsis
          style={{ marginLeft: `${gapPx}px` }}
        >
          {ellipsisText}
        </span>
      )}

      {/* Overflow pill — right-aligned, pushes to end */}
      {showOverflow && (
        <div className={styles.overflowPill}>
          {renderOverflowButton(numHiddenItems)}
        </div>
      )}
    </div>
  );
};
