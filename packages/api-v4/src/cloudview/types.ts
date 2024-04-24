import { Filter } from 'src/types';

export interface Namespace {
  id: number;
  label: string;
  region: string;
  type: string;
  urls: {
    ingest: string;
    read: string;
    agent_install: string;
  };
  created: string;
  updated: string;
}

export interface Dashboard {
  id: number;
  label: string;
  widgets: Widgets[];
  created: string;
  updated: string;
  time_granularity: TimeGranularity;
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

export interface CloudViewMetricsRequest {
  metric: string; // done
  filters: Filter[]; // widget level
  aggregate_function: string; // come from widget
  group_by: string; // come from widget
  time_duration: TimeDuration; // come from dashboard
  time_granularity: TimeGranularity; // comes from dashboard
  counter: number;
  startTime: number;
  endTime: number;
  resource_id: string[];
}

export interface CloudViewMetricsResponse {
  data: CloudViewMetricsResponseData;
  isPartial: boolean;
  stats: {
    series_fetched: number;
  };
  status: string;
}

export interface CloudViewMetricsResponseData {
  result: CloudViewMetricsList[];
  result_type: string;
}

export interface CloudViewMetricsList {
  metric: any;
  values: Array<CloudViewMetricValues>;
}

export interface CloudViewMetrics {
  label: string;
  metric: string;
}

export interface CloudViewMetricValues {
  timestamp: number;
  value: string;
}

export interface NamespaceApiKey {
  active_keys: {
    api_key: string;
    expiry: string;
  }[];
}
export interface CreateNameSpacePayload {
  label: string | null;
  region: string | null;
  type: string | null;
}

export interface ServiceTypes {
  service_types: {
    service_type: string;
    price: string;
    available_metrics: {
      label: string;
      description: string;
      metric_label: string;
      metric_type: string;
      data_type: string;
      dimensions: {
        label: string;
        key: string;
        values: string[];
        data_type: string;
        description: string;
      }[];
    }[];
  }[];
}

export interface MonitorServiceType {
  service_type: string;
  price: string;
  available_metrics: AvailableMetrics[];
}

export interface MetricDefinitions {
  available_metrics: AvailableMetrics[];
}

export interface AvailableMetrics {
  label: string;
  metric: string;
  metric_type: string;
  unit: string;
  scrape_interval: string;
  available_aggregate_functions: AvailableAggregateFunctions[];
}

export interface AvailableAggregateFunctions {
  label: string;
  dim_label: string;
  values: string[];
}

export interface JWEToken {
  payload: any; // remove
  token: string;
}

export interface GetJWETokenPayload {
  resource_id: number[];
}
