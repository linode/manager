import type {
  MouseHandlerDataParam,
  TooltipContentProps,
  TooltipPayload,
} from 'recharts';
import type { CustomTooltipOptions } from 'src/components/AreaChart/AreaChart';

export type TooltipPayloadEntryWithData = TooltipPayload[number] & {
  payload: {
    [key: string]: number;
    timestamp: number;
  };
};

export type TooltipPayloadWithData = TooltipPayloadEntryWithData[];

export interface TooltipMetricRowProps {
  /**
   * The color of the area corresponding to this metric, used for the color indicator in the tooltip row.
   */
  areaColor: string;
  /**
   * The name of the metric to display in the tooltip row.
   */
  metricName: string;
  /**
   * The formatted value of the metric to display in the tooltip row, including any unit or custom formatting.
   */
  metricValueLabel: string;
}

export interface CloudPulseTooltipProps extends TooltipContentProps {
  /**
   * Optional grouped options used by custom tooltip renderers.
   */
  customTooltipOptions?: CustomTooltipOptions;

  /**
   * timezone for formatting the tooltip label timestamp
   */
  timezone: string;

  /**
   * formatter for the tooltip value
   */
  tooltipCustomValueFormatter?: (value: number, unit: string) => string;

  /**
   * Optional ref to the tooltip wrapper element. Used for measuring tooltip dimensions during positioning.
   */
  tooltipRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * unit to be displayed with data in tooltip
   */
  unit: string;
}

export interface TooltipFilter {
  /**
   * The data key of the metric that is currently pinned or hovered in the tooltip. This is used to filter the tooltip content to only show information for the selected metric.
   */
  dataKey: string;
}

export interface TooltipFilterHandlerResult {
  /**
   * Callback for handling clicks on active dots in the chart. When an active dot is clicked, it toggles the pinned state of the tooltip for that metric.
   */
  handleActiveDotClick: (dataKey: string) => void;
  /**
   * Callback for handling mouse enter events on active dots in the chart. When an active dot is hovered, it sets the hovered state for the tooltip to show information for that metric.
   */
  handleActiveDotMouseEnter: (dataKey: string) => void;
  /**
   * Callback for handling mouse leave events on active dots in the chart. When the mouse leaves an active dot, it clears the hovered state for the tooltip.
   */
  handleActiveDotMouseLeave: () => void;
  /**
   * Callback for handling mouse click events on the tooltip filter. When the tooltip filter is clicked, it clears any pinned or hovered state for the tooltip.
   */
  handleTooltipFilterOnChartClick: () => void;
  /**
   * Fully resets tooltip filtering state to default full-tooltip mode.
   */
  resetTooltipFilter: () => void;
  /**
   * The current tooltip filter state, which includes the data key of the metric that is currently pinned or hovered. If no metric is pinned or hovered, this will be undefined.
   */
  tooltipFilter: TooltipFilter | undefined;
}

export interface TooltipOwnershipResult {
  /**
   * Claims ownership of the tooltip visibility for the current widget. When called, this will set the tooltip to be visible and notify other widgets to hide their tooltips.
   */
  claimTooltipVisibility: () => void;
  /**
   * Indicates whether the tooltip is currently visible for the current widget. This state is managed in coordination with other widgets to ensure only one tooltip is visible at a time.
   */
  isTooltipVisible: boolean;
  /**
   * Releases ownership of the tooltip visibility for the current widget. When called, this will set the tooltip to be hidden and allow other widgets to show their tooltips if they claim ownership.
   */
  releaseTooltipVisibility: () => void;
}

export interface Coordinate {
  /**
   * The x-coordinate for tooltip placement
   */
  x: number;
  /**
   * The y-coordinate for tooltip placement
   */
  y: number;
}

export interface TooltipState {
  maxHeight: number;
  pos: Coordinate | undefined;
}

export interface TooltipPositionInfo {
  /**
   * Ref for the chart container element, used to calculate tooltip positioning relative to the chart and viewport.
   */
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Mouse move handler that calculates and updates tooltip position based on cursor location, chart container dimensions, and viewport boundaries. It ensures the tooltip stays within the visible area of the screen by adjusting its position accordingly.
   */
  handleMouseMove: (chartData: MouseHandlerDataParam) => void;
  /**
   * Recalculates tooltip position using the last known chart data. Call this after tooltip content changes (e.g. filtered tooltip) to re-anchor position based on new dimensions.
   */
  recalculate: () => void;
  /**
   * Resets tooltip position and maxHeight to defaults, typically on mouse leave.
   */
  reset: () => void;
  /**
   * Dynamic max height for the tooltip content, derived from viewport availability.
   */
  tooltipMaxHeight: number;
  /**
   * Current position of the tooltip, which is dynamically updated based on mouse movements and calculated to prevent overflow outside the viewport. It contains x and y coordinates for tooltip placement.
   */
  tooltipPos: Coordinate | undefined;
  /**
   * Ref for the tooltip element, used to measure its dimensions for accurate positioning calculations.
   */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}
