export type AlertSeverityType = 0 | 1 | 2 | 3;
export type MetricAggregationType = 'avg' | 'count' | 'max' | 'min' | 'sum';
export type MetricOperatorType = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
export type AlertServiceType = 'dbaas' | 'linode';
export type AlertClass = 'dedicated' | 'shared';
export type DimensionFilterOperatorType =
  | 'endswith'
  | 'eq'
  | 'neq'
  | 'startswith';
export type AlertDefinitionType = 'system' | 'user';
export type AlertStatusType = 'disabled' | 'enabled' | 'failed' | 'in progress';
export type CriteriaConditionType = 'ALL';
export type MetricUnitType =
  | 'bit_per_second'
  | 'byte'
  | 'GB'
  | 'KB'
  | 'MB'
  | 'millisecond'
  | 'number'
  | 'percent'
  | 'second';
export type NotificationStatus = 'Disabled' | 'Enabled';
export type ChannelType = 'email' | 'pagerduty' | 'slack' | 'webhook';
export type AlertNotificationType = 'custom' | 'default';
type AlertNotificationEmail = 'email';
type AlertNotificationSlack = 'slack';
type AlertNotificationPagerDuty = 'pagerduty';
type AlertNotificationWebHook = 'webhook';
export interface Dashboard {
  created: string;
  id: number;
  label: string;
  service_type: string;
  time_duration: TimeDuration;
  updated: string;
  widgets: Widgets[];
}

export interface TimeGranularity {
  label?: string;
  unit: string;
  value: number;
}

export interface TimeDuration {
  unit: string;
  value: number;
}

export interface DateTimeWithPreset {
  end: string;
  preset?: string;
  start: string;
}

export interface Widgets {
  aggregate_function: string;
  chart_type: 'area' | 'line';
  color: string;
  entity_ids: string[];
  filters: Filters[];
  group_by: string[];
  label: string;
  metric: string;
  namespace_id: number;
  region_id: number;
  service_type: string;
  serviceType: string;
  size: number;
  time_duration: TimeDuration;
  time_granularity: TimeGranularity;
  unit: string;
  y_label: string;
}

export interface Filters {
  dimension_label: string;
  operator: string;
  value: string;
}

export type FilterValue =
  | DateTimeWithPreset
  | number
  | number[]
  | string
  | string[]
  | undefined
  | WidgetFilterValue;

type WidgetFilterValue = { [key: string]: AclpWidget };

export interface AclpConfig {
  [key: string]: FilterValue;
  widgets?: WidgetFilterValue;
}

export interface AclpWidget {
  aggregateFunction: string;
  label: string;
  size: number;
  timeGranularity: TimeGranularity;
}

export interface MetricDefinition {
  available_aggregate_functions: string[];
  dimensions: Dimension[];
  is_alertable: boolean;
  label: string;
  metric: string;
  metric_type: string;
  scrape_interval: string;
  unit: string;
}

export interface Dimension {
  dimension_label: string;
  label: string;
  values: string[];
}

export interface JWETokenPayLoad {
  entity_ids: number[];
}

export interface JWEToken {
  token: string;
}

export interface Metric {
  aggregate_function: string;
  name: string;
}

export interface CloudPulseMetricsRequest {
  absolute_time_duration: DateTimeWithPreset | undefined;
  entity_ids: number[];
  filters?: Filters[];
  group_by: string[];
  metrics: Metric[];
  relative_time_duration: TimeDuration | undefined;
  time_granularity: TimeGranularity | undefined;
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

export interface ServiceTypes {
  label: string;
  service_type: string;
}

export interface ServiceTypesList {
  data: ServiceTypes[];
}

export interface CreateAlertDefinitionPayload {
  channel_ids: number[];
  description?: string;
  entity_ids?: string[];
  label: string;
  rule_criteria: {
    rules: MetricCriteria[];
  };
  severity: AlertSeverityType;
  tags?: string[];
  trigger_conditions: TriggerCondition;
}

export interface MetricCriteria {
  aggregate_function: MetricAggregationType;
  dimension_filters?: DimensionFilter[];
  metric: string;
  operator: MetricOperatorType;
  threshold: number;
}

export interface AlertDefinitionMetricCriteria
  extends Omit<MetricCriteria, 'dimension_filters'> {
  dimension_filters?: AlertDefinitionDimensionFilter[];
  label: string;
  unit: string;
}
export interface DimensionFilter {
  dimension_label: string;
  operator: DimensionFilterOperatorType;
  value: string;
}

export interface AlertDefinitionDimensionFilter extends DimensionFilter {
  label: string;
}
export interface TriggerCondition {
  criteria_condition: CriteriaConditionType;
  evaluation_period_seconds: number;
  polling_interval_seconds: number;
  trigger_occurrences: number;
}
export interface Alert {
  alert_channels: {
    id: number;
    label: string;
    type: 'alert-channel';
    url: string;
  }[];
  class?: AlertClass;
  created: string;
  created_by: string;
  description: string;
  entity_ids: string[];
  has_more_resources: boolean;
  id: number;
  label: string;
  rule_criteria: {
    rules: AlertDefinitionMetricCriteria[];
  };
  service_type: AlertServiceType;
  severity: AlertSeverityType;
  status: AlertStatusType;
  tags: string[];
  trigger_conditions: TriggerCondition;
  type: AlertDefinitionType;
  updated: string;
  updated_by: string;
}

interface NotificationChannelAlerts {
  id: number;
  label: string;
  type: 'alerts-definitions';
  url: string;
}
interface NotificationChannelBase {
  alerts: NotificationChannelAlerts[];
  channel_type: ChannelType;
  created_at: string;
  created_by: string;
  id: number;
  label: string;
  status: NotificationStatus;
  type: AlertNotificationType;
  updated_at: string;
  updated_by: string;
}

interface NotificationChannelEmail extends NotificationChannelBase {
  channel_type: AlertNotificationEmail;
  content: {
    email: {
      email_addresses: string[];
      message: string;
      subject: string;
    };
  };
}

interface NotificationChannelSlack extends NotificationChannelBase {
  channel_type: AlertNotificationSlack;
  content: {
    slack: {
      message: string;
      slack_channel: string;
      slack_webhook_url: string;
    };
  };
}

interface NotificationChannelPagerDuty extends NotificationChannelBase {
  channel_type: AlertNotificationPagerDuty;
  content: {
    pagerduty: {
      attributes: string[];
      description: string;
      service_api_key: string;
    };
  };
}
interface NotificationChannelWebHook extends NotificationChannelBase {
  channel_type: AlertNotificationWebHook;
  content: {
    webhook: {
      http_headers: {
        header_key: string;
        header_value: string;
      }[];
      webhook_url: string;
    };
  };
}
export type NotificationChannel =
  | NotificationChannelEmail
  | NotificationChannelPagerDuty
  | NotificationChannelSlack
  | NotificationChannelWebHook;

export interface EditAlertDefinitionPayload {
  channel_ids?: number[];
  description?: string;
  entity_ids?: string[];
  label?: string;
  rule_criteria?: {
    rules: MetricCriteria[];
  };
  severity?: AlertSeverityType;
  status?: AlertStatusType;
  tags?: string[];
  trigger_conditions?: TriggerCondition;
}

export interface EditAlertPayloadWithService
  extends EditAlertDefinitionPayload {
  alertId: number;
  serviceType: string;
}

export type AlertStatusUpdateType = 'Disable' | 'Enable';

export interface EntityAlertUpdatePayload {
  alert: Alert;
  entityId: string;
}

export interface DeleteAlertPayload {
  alertId: number;
  serviceType: string;
}
