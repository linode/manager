import React from 'react';

import type { MouseHandlerDataParam } from 'recharts';

export const TOOLTIP_POSITIONING = {
  edgePadding: 10,
  horizontalGap: 8,
  verticalGap: 8,
  sideBarWidthAdjustment: 250, // sidebar width
};

interface TooltipPositioningReturn {
  /**
   * Ref for the chart container element, used to calculate tooltip positioning relative to the chart and viewport.
   */
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Mouse move handler that calculates and updates tooltip position based on cursor location, chart container dimensions, and viewport boundaries. It ensures the tooltip stays within the visible area of the screen by adjusting its position accordingly.
   */
  handleMouseMove: (chartData: MouseHandlerDataParam) => void;
  /**
   * Current position of the tooltip, which is dynamically updated based on mouse movements and calculated to prevent overflow outside the viewport. It contains x and y coordinates for tooltip placement.
   */
  tooltipPos: Coordinate | undefined;
  /**
   * Ref for the tooltip element, used to measure its dimensions for accurate positioning calculations.
   */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

interface Coordinate {
  /**
   * The x-coordinate for tooltip placement
   */
  x: number;
  /**
   * The y-coordinate for tooltip placement
   */
  y: number;
}

/**
 * Custom hook to manage dynamic tooltip positioning based on viewport boundaries.
 * Ensures tooltips don't overflow outside the viewport by adjusting position
 * relative to chart quadrants and available space.
 */
export const useTooltipPositioning = (
  originalOnMouseMove?: (chartData: MouseHandlerDataParam) => void,
  isMobileOrTablet?: boolean
): TooltipPositioningReturn => {
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<Coordinate | undefined>(
    undefined
  );

  const handleMouseMove = (chartData: MouseHandlerDataParam) => {
    originalOnMouseMove?.(chartData);

    if (
      isMobileOrTablet ||
      tooltipRef.current === null ||
      chartContainerRef.current === null ||
      chartData.activeCoordinate === undefined
    ) {
      // On mobile devices or when data not available, we rely on the default tooltip behavior without dynamic positioning
      setTooltipPos(undefined);
      return;
    }

    const { horizontalGap, edgePadding, verticalGap, sideBarWidthAdjustment } =
      TOOLTIP_POSITIONING;

    const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
    const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;

    const {
      height: containerHeight,
      left: containerLeft,
      top: containerTop,
      width: containerWidth,
    } = chartContainerRef.current.getBoundingClientRect();
    const cx = chartData.activeCoordinate.x;
    const cy = chartData.activeCoordinate.y;

    const absolutePointX = containerLeft + cx;
    const absolutePointY = containerTop + cy;

    // Determine horizontal placement
    const preferLeftByChartPosition = cx >= containerWidth / 2;
    const overflowsViewportRight =
      absolutePointX + horizontalGap + tooltipWidth >
      window.innerWidth - edgePadding;
    const overflowsViewportLeft =
      absolutePointX - horizontalGap - tooltipWidth - sideBarWidthAdjustment <
      edgePadding;
    const placeLeft =
      (preferLeftByChartPosition || overflowsViewportRight) &&
      !overflowsViewportLeft;

    // Determine vertical placement
    const overflowsViewportBottom =
      absolutePointY + verticalGap + tooltipHeight > window.innerHeight;
    const preferTopByChartPosition = cy > containerHeight / 2;
    const placeAbove = overflowsViewportBottom || preferTopByChartPosition;

    const x = placeLeft
      ? cx - tooltipWidth - horizontalGap
      : cx + horizontalGap;
    const y = placeAbove ? cy - tooltipHeight - verticalGap : cy + verticalGap;

    setTooltipPos({ x, y });
  };

  return {
    chartContainerRef,
    handleMouseMove,
    tooltipPos,
    tooltipRef,
  };
};
