export interface Dashboard {
  id: number;
  label: string;
  widgets: Widgets[];
  created: string;
  updated: string;
  time_duration: TimeDuration;
  service_type: string;
}

export interface TimeGranularity {
  unit: string;
  value: number;
}

export interface TimeDuration {
  unit: string;
  value: number;
}

export interface Widgets {
  label: string;
  metric: string;
  aggregate_function: string;
  group_by: string;
  region_id: number;
  namespace_id: number;
  color: string;
  size: number;
  chart_type: string;
  y_label: string;
  filters: Filters[];
  serviceType: string;
  service_type: string;
  resource_id: string[];
  time_granularity: TimeGranularity;
  time_duration: TimeDuration;
  unit: string;
}

export interface Filters {
  key: string;
  operator: string;
  value: string;
}

// Define the type for filter values
type FilterValue =
  | number
  | string
  | string[]
  | number[]
  | WidgetFilterValue
  | undefined;

type WidgetFilterValue = { [key: string]: AclpWidget };

export interface AclpConfig {
  // we maintain only the filters selected in the preferences for latest selected dashboard
  [key: string]: FilterValue;
  widgets?: WidgetFilterValue;
}

export interface AclpWidget {
  aggregateFunction: string;
  timeGranularity: TimeGranularity;
  label: string;
  size: number;
}

export interface MetricDefinitions {
  data: AvailableMetrics[];
}

export interface AvailableMetrics {
  label: string;
  metric: string;
  metric_type: string;
  unit: string;
  scrape_interval: string;
  available_aggregate_functions: string[];
  dimensions: Dimension[];
}

export interface Dimension {
  label: string;
  dimension_label: string;
  values: string[];
}

export interface JWETokenPayLoad {
  resource_ids: number[];
}

export interface JWEToken {
  token: string;
}

export interface CloudPulseMetricsRequest {
  metric: string;
  filters?: Filters[];
  aggregate_function: string;
  group_by: string;
  relative_time_duration: TimeDuration;
  time_granularity: TimeGranularity | undefined;
  resource_id: number[];
}

export interface CloudPulseMetricsResponse {
  data: CloudPulseMetricsResponseData;
  isPartial: boolean;
  stats: {
    series_fetched: number;
  };
  status: string;
}

export interface CloudPulseMetricsResponseData {
  result: CloudPulseMetricsList[];
  result_type: string;
}

export interface CloudPulseMetricsList {
  metric: { [resourceName: string]: string };
  values: [number, string][];
}
