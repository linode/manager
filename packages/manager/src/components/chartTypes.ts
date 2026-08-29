// Types shared between AreaChart and BarChart (and their consumers), so both chart
// implementations and any future chart-switching layer can rely on one common shape.
import type { SxProps } from '@mui/material/styles';
import type { MouseHandlerDataParam, TooltipContentProps } from 'recharts';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

export interface DataSet {
  [label: string]: number;
  timestamp: number;
}

export type TooltipMetricEntry = [string, number];

export type TooltipEntriesByTimestamp = Map<number, TooltipMetricEntry[]>;

export interface ActiveDotHandlers {
  /**
   * Callback fired when an active dot is clicked. The dataKey of the corresponding series is passed as an argument.
   */
  onClick?: (dataKey: string) => void;
  /**
   * Callback fired when the mouse enters an active dot. The dataKey of the corresponding series is passed as an argument.
   */
  onMouseEnter?: (dataKey: string) => void;
  /**
   * Callback fired when the mouse leaves an active dot.
   */
  onMouseLeave?: () => void;
}

export interface ChartCallbacks {
  /**
   * Callback fired on click event on the chart
   */
  onClick?: (e: MouseHandlerDataParam) => void;
  /**
   * Callback fired on mouse down event on the chart
   */
  onMouseDown?: (e: MouseHandlerDataParam) => void;
  /**
   * Callback fired on mouse leave event on the chart.
   */
  onMouseLeave?: () => void;
  /**
   * Callback fired on mouse move event on the chart
   */
  onMouseMove?: (e: MouseHandlerDataParam) => void;
  /**
   * Callback fired on mouse up event on the chart
   */
  onMouseUp?: (e: MouseHandlerDataParam) => void;
}

export interface ReferenceAreaProps {
  /**
   * Ending x-axis value of the reference area
   */
  referenceEnd: number;
  /**
   * Starting x-axis value of the reference area
   */
  referenceStart: number;
}

export interface XAxisProps {
  /**
   * format for the x-axis timestamp
   * ex: 'hh' to convert timestamp into hour
   */
  tickFormat: string;

  /**
   * represents the pixel gap between two x-axis ticks
   */
  tickGap: number;
}

export interface YAxisProps {
  /**
   * The formatter function for the y-axis tick.
   */
  tickFormat: (value: number) => string;
}

export interface BaseCustomTooltipOptions {
  /**
   * Optional prop to show the tooltip or not
   */
  active?: boolean;
  /**
   * Optional active dot interaction handlers.
   */
  activeDotHandlers?: ActiveDotHandlers;

  dataColorMap?: Record<string, string>;

  /**
   * The hidden legend rows , not to be show in the tooltip. This allows the tooltip to reflect the same legend state as the on-screen graph.
   */
  hiddenLegendRows?: string[];

  /** Controls whether tooltip content should be rendered as active. */
  isTooltipVisible?: boolean;

  /**
   * Called after filteredTooltip state changes (e.g. after active dot click). Use this to trigger tooltip position recalculation with updated tooltip dimensions.
   */
  onFilteredTooltipChange?: () => void;

  /**
   * Optional precomputed tooltip metric entries keyed by timestamp.
   */
  tooltipEntriesByTimestamp?: TooltipEntriesByTimestamp;

  /**
   * Optional externally controlled tooltip filter.
   */
  tooltipFilter?: { dataKey: string };

  /**
   * Optional CSS properties to apply to the tooltip content container.
   */
  tooltipWrapperStyle?: SxProps;
}

export interface BaseCustomTooltipProps extends TooltipContentProps {
  /**
   * timezone for formatting the tooltip label timestamp. Not applicable for non-timed (categorical) charts.
   */
  timezone?: string;

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

export interface DataPlot {
  /**
   * The color of the area/bar corresponding to this metric, used for the color indicator in the tooltip row.
   */
  color: string;
  /**
   * The name of the metric to display in the tooltip row.
   */
  dataKey: string;

  /**
   * optional stack id; areas/bars with the same id are stacked together
   */
  stackId?: string;
}

export interface BaseChartProps {
  areas: DataPlot[];

  /**
   * aria-label for the graph
   */
  ariaLabel: string;

  /**
   * chart callbacks (onMouseDown, onMouseMove, onMouseUp, onMouseLeave)
   */
  chartCallbacks?: ChartCallbacks;

  /**
   * Optional ref to the chart container element. Used for viewport boundary calculations during tooltip positioning.
   */
  chartContainerRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * connect nulls value between two data points
   */
  connectNulls?: boolean;

  /**
   * curve type for the area chart
   * @default monotone
   */
  curveType?: 'linear' | 'monotone' | 'natural';

  /**
   * If passed, the chart will use this tooltip component instead of the default one. This allows for custom tooltip rendering according to consumers.
   */
  CustomConsumerTooltip?: React.ComponentType<CustomTooltipProps>;

  /**
   * Optional grouped options used only by custom tooltip renderers.
   */
  customTooltipOptions?: BaseCustomTooltipOptions;

  /**
   * data to be displayed on the graph
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;

  /**
   * radius of the dots to be displayed
   */
  dotRadius?: number;

  /**
   * The fill opacity of the area. If variant is 'line', this will be ignored and the area will be transparent.
   */
  fillOpacity?: number;

  /**
   * The height of chart container.
   */
  height?: number;

  /**
   * Sets the height of the legend. Overflow scroll if the content exceeds the height.
   */
  legendHeight?: string;

  /**
   * list of legends rows to be displayed
   */
  legendRows?: Omit<MetricsDisplayRow[], 'handleLegendClick'>;

  /**
   * The sizes of whitespace around the container.
   */
  margin?: { bottom: number; left: number; right: number; top: number };

  /**
   * On Click of legend row, returns the list of hidden series. This is used for accessibility purposes to announce which series are hidden when a legend row is clicked.
   */
  onHiddenDataPlotsChange?: (hiddenKeys: string[]) => void;

  /**
   * reference area to be highlighted on the chart
   */
  referenceArea?: null | ReferenceAreaProps;

  /**
   * property to show dot or not
   */
  showDot?: boolean;

  /**
   * true to display legends rows else false to hide
   * @default false
   */
  showLegend?: boolean;

  /**
   * timezone for the timestamp of graph data.
   */
  timezone: string;

  /**
   * formatter for the tooltip value
   */
  tooltipCustomValueFormatter?: (value: number, unit: string) => string;

  /**
   * Optional tooltip position. When provided, overrides default recharts positioning.
   */
  tooltipPosition?: undefined | { x: number; y: number };

  /**
   * Optional ref to the tooltip wrapper element. Used for measuring tooltip dimensions during positioning.
   */
  tooltipRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * unit to be displayed with data
   */
  unit: string;

  /**
   * Variant of the chart. For AreaChart, it can be 'area' or 'line'. For BarChart, it can be 'normal' or 'stacked'.
   */
  variant?: 'area' | 'line' | 'normal' | 'stacked';

  /**
   * The width of chart container.
   */
  width?: number;

  /**
   * x-axis properties.
   */
  xAxis: XAxisProps;

  /**
   * number of x-axis ticks should be shown
   * 0 or undefined : ticks will be generated by recharts
   * non-zero value : this many ticks will be generated based on the starting & ending timestamp in the data
   */
  xAxisTickCount?: number;

  /**
   * y-axis properties
   */
  yAxisProps?: YAxisProps;
}

export interface CustomTooltipOptions {
  /**
   * Optional prop to show the tooltip or not
   */
  active?: boolean;
  /**
   * Optional active dot interaction handlers.
   */
  activeDotHandlers?: ActiveDotHandlers;

  /**
   * The color mapping for each area in the chart.
   */
  dataColorMap?: Record<string, string>;

  /**
   * The hidden legend rows , not to be show in the tooltip. This allows the tooltip to reflect the same legend state as the on-screen graph.
   */
  hiddenLegendRows?: string[];

  /** Controls whether tooltip content should be rendered as active. */
  isTooltipVisible?: boolean;

  /**
   * Called after filteredTooltip state changes (e.g. after active dot click). Use this to trigger tooltip position recalculation with updated tooltip dimensions.
   */
  onFilteredTooltipChange?: () => void;

  /**
   * Optional precomputed tooltip metric entries keyed by timestamp.
   */
  tooltipEntriesByTimestamp?: TooltipEntriesByTimestamp;

  /**
   * Optional externally controlled tooltip filter.
   */
  tooltipFilter?: { dataKey: string };

  /**
   * Optional CSS properties to apply to the tooltip content container.
   */
  tooltipWrapperStyle?: SxProps;
}

export interface CustomTooltipProps extends TooltipContentProps {
  /**
   * Optional grouped options used by custom tooltip renderers.
   */
  customTooltipOptions?: BaseCustomTooltipOptions;

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
