export type AlertSeverityType = 0 | 1 | 2 | 3;
export type MetricAggregationType = 'avg' | 'sum' | 'min' | 'max' | 'count';
export type MetricOperatorType = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
export type AlertServiceType = 'linode' | 'dbaas';
export type AlertClass = 'dedicated' | 'shared';
export type DimensionFilterOperatorType =
  | 'eq'
  | 'neq'
  | 'startswith'
  | 'endswith';
export type WidgetDimensionFilterOperatorType = DimensionFilterOperatorType | 'in';
export type AlertDefinitionType = 'system' | 'user';
export type AlertStatusType = 'enabled' | 'disabled' | 'in progress' | 'failed';
export type CriteriaConditionType = 'ALL';
export type MetricUnitType =
  | 'number'
  | 'byte'
  | 'second'
  | 'percent'
  | 'bit_per_second'
  | 'millisecond'
  | 'KB'
  | 'MB'
  | 'GB';
export type NotificationStatus = 'Enabled' | 'Disabled';
export type ChannelType = 'email' | 'slack' | 'pagerduty' | 'webhook';
export type AlertNotificationType = 'default' | 'custom';
type AlertNotificationEmail = 'email';
type AlertNotificationSlack = 'slack';
type AlertNotificationPagerDuty = 'pagerduty';
type AlertNotificationWebHook = 'webhook';
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
  label?: string;
}

export interface TimeDuration {
  unit: string;
  value: number;
}

export interface DateTimeWithPreset {
  end: string;
  start: string;
  preset?: string;
}

export interface Widgets {
  aggregate_function: string;
  chart_type: 'line' | 'area';
  color: string;
  entity_ids: string[];
  filters: WidgetDimensionFilter[];
  group_by: string;
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
  key: string;
  operator: string;
  value: string;
}

export type FilterValue =
  | number
  | string
  | string[]
  | number[]
  | WidgetFilterValue
  | DateTimeWithPreset
  | undefined;

type WidgetFilterValue = { [key: string]: AclpWidget };

export interface AclpConfig {
  [key: string]: FilterValue;
  widgets?: WidgetFilterValue;
}

export interface AclpWidget {
  aggregateFunction: string;
  timeGranularity: TimeGranularity;
  label: string;
  size: number;
}

export interface MetricDefinition {
  label: string;
  metric: string;
  metric_type: string;
  unit: string;
  scrape_interval: string;
  available_aggregate_functions: string[];
  dimensions: Dimension[];
  is_alertable: boolean;
}

export interface Dimension {
  label: string;
  dimension_label: string;
  values: string[];
}

export interface JWETokenPayLoad {
  entity_ids: number[];
}

export interface JWEToken {
  token: string;
}

export interface CloudPulseMetricsRequest {
  absolute_time_duration: DateTimeWithPreset | undefined;
  aggregate_function: string;
  entity_ids: number[];
  filters?: WidgetDimensionFilter[];
  group_by: string;
  metric: string;
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
  service_type: string;
  label: string;
}

export interface ServiceTypesList {
  data: ServiceTypes[];
}

export interface CreateAlertDefinitionPayload {
  label: string;
  tags?: string[];
  description?: string;
  entity_ids?: string[];
  severity: AlertSeverityType;
  rule_criteria: {
    rules: MetricCriteria[];
  };
  trigger_conditions: TriggerCondition;
  channel_ids: number[];
}

export interface MetricCriteria {
  metric: string;
  aggregate_function: MetricAggregationType;
  operator: MetricOperatorType;
  threshold: number;
  dimension_filters?: DimensionFilter[];
}

export interface AlertDefinitionMetricCriteria
  extends Omit<MetricCriteria, 'dimension_filters'> {
  unit: string;
  label: string;
  dimension_filters?: AlertDefinitionDimensionFilter[];
}
export interface DimensionFilter {
  dimension_label: string;
  operator: DimensionFilterOperatorType;
  value: string;
}

export interface WidgetDimensionFilter {
  dimension_label: string;
  operator: WidgetDimensionFilterOperatorType;
  value: string;
}

export interface AlertDefinitionDimensionFilter extends DimensionFilter {
  label: string;
}
export interface TriggerCondition {
  polling_interval_seconds: number;
  evaluation_period_seconds: number;
  trigger_occurrences: number;
  criteria_condition: CriteriaConditionType;
}
export interface Alert {
  id: number;
  label: string;
  tags: string[];
  description: string;
  class?: AlertClass;
  has_more_resources: boolean;
  status: AlertStatusType;
  type: AlertDefinitionType;
  severity: AlertSeverityType;
  service_type: AlertServiceType;
  entity_ids: string[];
  rule_criteria: {
    rules: AlertDefinitionMetricCriteria[];
  };
  trigger_conditions: TriggerCondition;
  alert_channels: {
    id: number;
    label: string;
    url: string;
    type: 'alert-channel';
  }[];
  created_by: string;
  updated_by: string;
  created: string;
  updated: string;
}

interface NotificationChannelAlerts {
  id: number;
  label: string;
  url: string;
  type: 'alerts-definitions';
}
interface NotificationChannelBase {
  id: number;
  label: string;
  channel_type: ChannelType;
  type: AlertNotificationType;
  status: NotificationStatus;
  alerts: NotificationChannelAlerts[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface NotificationChannelEmail extends NotificationChannelBase {
  channel_type: AlertNotificationEmail;
  content: {
    email: {
      email_addresses: string[];
      subject: string;
      message: string;
    };
  };
}

interface NotificationChannelSlack extends NotificationChannelBase {
  channel_type: AlertNotificationSlack;
  content: {
    slack: {
      slack_webhook_url: string;
      slack_channel: string;
      message: string;
    };
  };
}

interface NotificationChannelPagerDuty extends NotificationChannelBase {
  channel_type: AlertNotificationPagerDuty;
  content: {
    pagerduty: {
      service_api_key: string;
      attributes: string[];
      description: string;
    };
  };
}
interface NotificationChannelWebHook extends NotificationChannelBase {
  channel_type: AlertNotificationWebHook;
  content: {
    webhook: {
      webhook_url: string;
      http_headers: {
        header_key: string;
        header_value: string;
      }[];
    };
  };
}
export type NotificationChannel =
  | NotificationChannelEmail
  | NotificationChannelSlack
  | NotificationChannelWebHook
  | NotificationChannelPagerDuty;

export interface EditAlertDefinitionPayload {
  label?: string;
  tags?: string[];
  description?: string;
  entity_ids?: string[];
  severity?: AlertSeverityType;
  rule_criteria?: {
    rules: MetricCriteria[];
  };
  trigger_conditions?: TriggerCondition;
  channel_ids?: number[];
  status?: AlertStatusType;
}

export interface EditAlertPayloadWithService
  extends EditAlertDefinitionPayload {
  serviceType: string;
  alertId: number;
}

export type AlertStatusUpdateType = 'Enable' | 'Disable';

export interface EntityAlertUpdatePayload {
  entityId: string;
  alert: Alert;
}
