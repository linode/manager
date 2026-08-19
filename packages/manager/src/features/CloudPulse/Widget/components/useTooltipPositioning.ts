import React from 'react';

import type { TooltipPositionInfo, TooltipState } from './chartTypes';
import type { MouseHandlerDataParam } from 'recharts';

export const TOOLTIP_POSITIONING = {
  edgePadding: 10,
  horizontalGap: 6,
  maxHeight: 600,
  verticalGap: 6,
  additionalGap: 40,
};

/**
 * Custom hook to manage dynamic tooltip positioning based on viewport boundaries.
 * Ensures tooltips don't overflow outside the viewport by adjusting position
 * relative to available viewport space.
 */
export const useTooltipPositioning = (
  originalOnMouseMove?: (chartData: MouseHandlerDataParam) => void,
  isMobileOrTablet?: boolean
): TooltipPositionInfo => {
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const lastChartDataRef = React.useRef<MouseHandlerDataParam | undefined>(
    undefined
  );
  // Group state into a single object to prevent split render cycles
  const [tooltipState, setTooltipState] = React.useState<TooltipState>({
    maxHeight: TOOLTIP_POSITIONING.maxHeight,
    pos: undefined,
  });

  const processMouseMove = React.useCallback(
    (chartData: MouseHandlerDataParam) => {
      originalOnMouseMove?.(chartData);
      lastChartDataRef.current = chartData;

      if (
        isMobileOrTablet ||
        tooltipRef.current === null ||
        chartContainerRef.current === null ||
        chartData.activeCoordinate === undefined ||
        chartData.activeIndex === undefined
      ) {
        // On mobile devices or when data not available, we rely on the default tooltip behavior without dynamic positioning
        setTooltipState((prev) =>
          prev.pos === undefined &&
          prev.maxHeight === TOOLTIP_POSITIONING.maxHeight
            ? prev
            : { pos: undefined, maxHeight: TOOLTIP_POSITIONING.maxHeight }
        );
        return;
      }

      const {
        horizontalGap,
        edgePadding,
        maxHeight,
        verticalGap,
        additionalGap,
      } = TOOLTIP_POSITIONING;

      const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
      const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;

      const { left: containerLeft, top: containerTop } =
        chartContainerRef.current.getBoundingClientRect();
      const cx = chartData.activeCoordinate.x;
      const cy = chartData.activeCoordinate.y;

      const absolutePointX = containerLeft + cx;
      const absolutePointY = containerTop + cy;

      const availableSpaceBelow = Math.max(
        window.innerHeight - absolutePointY - verticalGap - edgePadding,
        0
      );
      const availableSpaceAbove = Math.max(
        absolutePointY - verticalGap - edgePadding - additionalGap,
        0
      );

      // Keep 600px when either side can accommodate it. If neither can, use the remaining view-port space minus the additional gap. This ensures the tooltip doesn't overflow the viewport.
      const nextTooltipMaxHeight =
        availableSpaceBelow >= maxHeight || availableSpaceAbove >= maxHeight
          ? maxHeight
          : Math.max(
              Math.max(availableSpaceBelow, availableSpaceAbove) -
                additionalGap,
              0
            );
      // Default: place top-right; flip to left if right side overflows viewport.
      const overflowsViewportRight =
        absolutePointX + horizontalGap + tooltipWidth >
        window.innerWidth - edgePadding;
      const overflowsViewportLeft =
        absolutePointX - horizontalGap - tooltipWidth < edgePadding;
      const placeLeft = overflowsViewportRight && !overflowsViewportLeft;

      // Keep tooltip above by default; place below only when top would overflow.
      const effectiveTooltipHeight = Math.min(
        tooltipHeight,
        nextTooltipMaxHeight
      );
      const placeAbove =
        availableSpaceAbove >= effectiveTooltipHeight + verticalGap;

      const x = placeLeft
        ? cx - tooltipWidth - horizontalGap
        : cx + horizontalGap;

      const y = placeAbove
        ? cy - tooltipHeight - verticalGap
        : cy + verticalGap;

      const minX = edgePadding - containerLeft;
      const maxX =
        window.innerWidth - edgePadding - containerLeft - tooltipWidth;
      const minY = edgePadding - containerTop;
      const maxY =
        window.innerHeight - edgePadding - containerTop - tooltipHeight;

      setTooltipState((prev) => {
        const nextPos = {
          x: Math.min(Math.max(x, minX), Math.max(minX, maxX)),
          y: Math.min(Math.max(y, minY), Math.max(minY, maxY)),
        };

        if (
          prev.maxHeight === nextTooltipMaxHeight &&
          prev.pos?.x === nextPos.x &&
          prev.pos?.y === nextPos.y
        ) {
          return prev;
        }

        return {
          maxHeight: nextTooltipMaxHeight,
          pos: nextPos,
        };
      });
    },
    [isMobileOrTablet, originalOnMouseMove]
  );

  const recalculate = React.useCallback(() => {
    if (lastChartDataRef.current) {
      processMouseMove(lastChartDataRef.current);
    }
  }, [processMouseMove]);

  const reset = React.useCallback(() => {
    lastChartDataRef.current = undefined;

    setTooltipState((prev) =>
      prev.pos === undefined && prev.maxHeight === TOOLTIP_POSITIONING.maxHeight
        ? prev
        : { pos: undefined, maxHeight: TOOLTIP_POSITIONING.maxHeight }
    );
  }, []);

  return {
    chartContainerRef,
    handleMouseMove: processMouseMove,
    tooltipMaxHeight: tooltipState.maxHeight,
    tooltipPos: tooltipState.pos,
    tooltipRef,
    recalculate,
    reset,
  };
};
