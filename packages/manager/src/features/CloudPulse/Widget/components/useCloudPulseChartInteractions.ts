import { roundTo } from '@akamai/compute-ui-core/formatting';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import {
  computeLegendRowsBasedOnData,
  computeZoomedInData,
} from '../../Utils/CloudPulseZoomInUtils';
import { humanizeLargeData } from '../../Utils/utils';
import { useTooltipFilterHandler } from './useTooltipFilterHandler';
import { useTooltipPositioning } from './useTooltipPositioning';
import { useTooltipVisibilityHandler } from './useTooltipVisibilityHandler';
import { useZoomController } from './useZoomController';

import type { ZoomState } from './useZoomController';
import type { MouseHandlerDataParam } from 'recharts';
import type {
  ActiveDotHandlers,
  ChartCallbacks,
  DataPlot,
  DataSet,
  TooltipEntriesByTimestamp,
  TooltipMetricEntry,
  YAxisProps,
} from 'src/components/chartTypes';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

/**
 * Custom hook to manage interactions for CloudPulse charts, including zoom, tooltip, and legend interactions.
 */
export interface UseCloudPulseChartInteractionsProps {
  /**
   * The dataset to be displayed in the chart. Each entry represents a data point.
   */
  data: DataSet[];
  /**
   * The legend rows associated with the chart.
   */
  legendRows?: Omit<MetricsDisplayRow, 'handleLegendClick'>[];
  /**
   * Callback function invoked when the zoom state changes.
   */
  onZoomChange?: (
    isZoomed: boolean,
    left: 'dataMin' | number,
    right: 'dataMax' | number
  ) => void;
  /**
   * The data plots (areas) to be displayed in the chart.
   */
  plots: DataPlot[];
  /**
   * The unit of measurement for the chart data.
   */
  unit: string;
  /**
   * A key that triggers a reset of the zoom state when it changes.
   */
  zoomResetKey: string;
}

export interface UseCloudPulseChartInteractionsResult {
  /**
   * Axis settings derived from the chart's flags and viewport size.
   */
  axis: {
    /**
     * Whether the viewport is small enough to use Recharts' default x-axis tick count.
     */
    isSmallScreen: boolean;
    /**
     * Formatter settings for the chart's y-axis.
     */
    yAxisProps: YAxisProps;
  };
  /**
   * Tooltip state and handlers shared by CloudPulse charts.
   */
  tooltip: {
    /**
     * Event handlers for interacting with an active chart plot.
     */
    activeDotHandlers: ActiveDotHandlers;
    /**
     * Ref to the chart container used to calculate tooltip placement.
     */
    chartContainerRef: React.RefObject<HTMLDivElement | null>;
    /**
     * Maps each plot's data key to its display color.
     */
    colorMap: Record<string, string> | undefined;
    /**
     * Whether the custom CloudPulse tooltip is enabled.
     */
    isCustomTooltipEnabled: boolean;
    /**
     * Whether this chart currently owns the visible tooltip.
     */
    isTooltipVisible: boolean;
    /**
     * Recalculates tooltip placement after its content changes.
     */
    recalculate: () => void;
    /**
     * Formats values displayed in the tooltip.
     */
    tooltipCustomValueFormatter: (value: number) => string;
    /**
     * Precomputed, descending metric values grouped by timestamp.
     */
    tooltipEntriesByTimestamp: TooltipEntriesByTimestamp | undefined;
    /**
     * The currently selected tooltip plot, if one is pinned or hovered.
     */
    tooltipFilter: undefined | { dataKey: string };
    /**
     * The largest tooltip height that fits in the viewport.
     */
    tooltipMaxHeight: number;
    /**
     * Chart mouse handlers that manage tooltip visibility and filtering.
     */
    tooltipMouseHandlers: Pick<
      ChartCallbacks,
      'onClick' | 'onMouseLeave' | 'onMouseMove'
    >;
    /**
     * The computed tooltip position relative to the chart.
     */
    tooltipPos: undefined | { x: number; y: number };
    /**
     * Ref to the tooltip element used to measure its dimensions.
     */
    tooltipRef: React.RefObject<HTMLDivElement | null>;
  };
  /**
   * Zoom state, derived data, and chart mouse handlers.
   */
  zoom: {
    /**
     * Mouse handlers that manage drag-to-zoom interactions.
     */
    chartCallbacks:
      | Pick<ChartCallbacks, 'onMouseDown' | 'onMouseMove' | 'onMouseUp'>
      | undefined;
    /**
     * Data restricted to the current zoom range.
     */
    data: DataSet[];
    /**
     * Whether the chart is currently displaying a zoomed range.
     */
    isZoomed: boolean;
    /**
     * Legend rows recalculated for the current zoom range.
     */
    legendRows: Omit<MetricsDisplayRow, 'handleLegendClick'>[] | undefined;
    /**
     * Resets the selected zoom range.
     */
    resetZoom: () => void;
    /**
     * The current zoom boundaries and in-progress reference area.
     */
    state: ZoomState;
  };
}

// Shared zoom/tooltip/legend interaction logic used by both CloudPulseLineGraph and CloudPulseBarChart
export const useCloudPulseChartInteractions = (
  props: UseCloudPulseChartInteractionsProps
): UseCloudPulseChartInteractionsResult => {
  const flags = useFlags();
  const theme = useTheme();

  const { plots, data, legendRows, onZoomChange, unit, zoomResetKey } = props;

  const isCustomTooltipEnabled = flags.aclp?.enableCustomTooltip ?? false; // default to false

  const colorMap = React.useMemo(() => {
    if (!isCustomTooltipEnabled) return undefined;
    const map: Record<string, string> = {};
    plots?.forEach(({ dataKey, color }) => {
      map[dataKey] = color;
    });
    return map;
  }, [plots, isCustomTooltipEnabled]);

  // to reduce the x-axis tick count for small screen
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isHumanizableUnit =
    flags.aclp?.humanizableUnits?.some(
      (unitElement) => unitElement.toLowerCase() === unit.toLowerCase()
    ) ?? false;

  const isZoomEnabled = flags.aclp?.enableZoomInCharts ?? false; // default to false

  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md')); // no need to enable dynamic tooltip positioning on mobile and tablets

  const {
    zoom,
    isZoomed,
    zoomOut: resetZoom,
    zoomCallbacks,
  } = useZoomController(zoomResetKey);

  const {
    tooltipPos,
    tooltipMaxHeight,
    handleMouseMove: handleTooltipPositioningMouseMove,
    chartContainerRef,
    tooltipRef,
    recalculate,
    reset,
  } = useTooltipPositioning(
    isZoomEnabled ? zoomCallbacks?.onMouseMove : undefined,
    isMobileOrTablet
  );
  const {
    handleActiveDotClick,
    handleActiveDotMouseEnter,
    handleActiveDotMouseLeave,
    handleTooltipFilterOnChartClick,
    resetTooltipFilter,
    tooltipFilter,
  } = useTooltipFilterHandler();
  const { claimTooltipVisibility, isTooltipVisible, releaseTooltipVisibility } =
    useTooltipVisibilityHandler(resetTooltipFilter);

  // Tooltip-specific mouse handlers (custom tooltip only)
  const tooltipMouseHandlers = React.useMemo(
    () =>
      isCustomTooltipEnabled
        ? {
            onMouseMove: (chartData: MouseHandlerDataParam) => {
              claimTooltipVisibility();
              handleTooltipPositioningMouseMove(chartData);
            },
            onMouseLeave: () => {
              releaseTooltipVisibility();
              reset();
            },
            onClick: (chartData: MouseHandlerDataParam) => {
              if (chartData.isTooltipActive && tooltipFilter?.dataKey) {
                handleTooltipFilterOnChartClick();
              }
            },
          }
        : {
            onMouseMove: (chartData: MouseHandlerDataParam) =>
              handleTooltipPositioningMouseMove(chartData),
            onMouseLeave: undefined,
            onClick: undefined,
          },
    [
      isCustomTooltipEnabled,
      claimTooltipVisibility,
      handleTooltipPositioningMouseMove,
      releaseTooltipVisibility,
      reset,
      tooltipFilter?.dataKey,
      handleTooltipFilterOnChartClick,
    ]
  );

  const zoomCallbackHandlers = React.useMemo(
    () =>
      isZoomEnabled
        ? {
            onMouseDown: (chartData: MouseHandlerDataParam) => {
              zoomCallbacks?.onMouseDown?.(chartData);
            },
            onMouseMove: (chartData: MouseHandlerDataParam) => {
              zoomCallbacks?.onMouseMove?.(chartData);
            },
            onMouseUp: () => {
              zoomCallbacks?.onMouseUp?.();
            },
          }
        : undefined,
    [isZoomEnabled, zoomCallbacks]
  );

  const zoomedData = React.useMemo(() => {
    if (!isZoomEnabled) {
      return data;
    }
    return computeZoomedInData({ data, zoom });
  }, [data, zoom, isZoomEnabled]);

  const zoomedLegendRows = React.useMemo(() => {
    if (!isZoomEnabled) {
      return legendRows;
    }
    return computeLegendRowsBasedOnData({
      zoom,
      data: zoomedData,
      legendRows,
      unit,
      isHumanizableUnit,
    });
  }, [isHumanizableUnit, isZoomEnabled, legendRows, unit, zoom, zoomedData]);

  const tooltipEntriesByTimestamp = React.useMemo<
    TooltipEntriesByTimestamp | undefined
  >(() => {
    if (!isCustomTooltipEnabled) {
      return undefined;
    }

    const entriesByTimestamp = new Map<number, TooltipMetricEntry[]>();

    for (const dataPoint of zoomedData) {
      const metricEntries = Object.entries(dataPoint)
        .filter(
          (entry): entry is TooltipMetricEntry =>
            entry[0] !== 'timestamp' && typeof entry[1] === 'number'
        )
        .sort(([, firstValue], [, secondValue]) => secondValue - firstValue);

      entriesByTimestamp.set(dataPoint.timestamp, metricEntries);
    }

    return entriesByTimestamp;
  }, [isCustomTooltipEnabled, zoomedData]);

  React.useEffect(() => {
    if (onZoomChange) {
      onZoomChange(isZoomed, zoom.left, zoom.right);
    }
  }, [isZoomed, onZoomChange, zoom.left, zoom.right]);

  const tooltipCustomValueFormatter = (value: number) => {
    const formattedValue = isHumanizableUnit
      ? humanizeLargeData(value)
      : roundTo(value);

    return isCustomTooltipEnabled
      ? `${formattedValue}`
      : `${formattedValue} ${unit}`;
  };

  const yAxisProps = isHumanizableUnit
    ? { tickFormat: (value: number) => `${humanizeLargeData(value)}` }
    : { tickFormat: (value: number) => `${roundTo(value, 3)}` };

  return {
    axis: {
      isSmallScreen,
      yAxisProps,
    },
    tooltip: {
      activeDotHandlers: {
        onClick: handleActiveDotClick,
        onMouseEnter: handleActiveDotMouseEnter,
        onMouseLeave: handleActiveDotMouseLeave,
      },
      chartContainerRef,
      colorMap,
      isCustomTooltipEnabled,
      isTooltipVisible,
      recalculate,
      tooltipCustomValueFormatter,
      tooltipEntriesByTimestamp,
      tooltipFilter,
      tooltipMaxHeight,
      tooltipMouseHandlers,
      tooltipPos,
      tooltipRef,
    },
    zoom: {
      chartCallbacks: zoomCallbackHandlers,
      data: zoomedData,
      isZoomed,
      legendRows: zoomedLegendRows,
      resetZoom,
      state: zoom,
    },
  };
};
