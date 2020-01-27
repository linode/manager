export interface ChartProps {
  height: number;
  loading: boolean;
  error?: string;
  isTooEarlyForGraphData: boolean;
  timezone: string;
  rangeSelection: string;
}
