import type {
  AlertServiceType,
  AlertSeverityType,
  ChannelTypes,
  CreateAlertDefinitionPayload,
  DimensionFilter,
  MetricAggregationType,
  MetricCriteria,
  MetricOperatorType,
} from '@linode/api-v4';

export interface CreateAlertDefinitionForm
  extends Omit<CreateAlertDefinitionPayload, 'rule_criteria' | 'severity'> {
  engineType: null | string;
  entity_ids: string[];
  region: string;
  rule_criteria: {
    rules: MetricCriteriaForm[];
  };
  serviceType: AlertServiceType | null;
  severity: AlertSeverityType | null;
}

export interface MetricCriteriaForm
  extends Omit<MetricCriteria, 'aggregation_type' | 'metric' | 'operator'> {
  aggregation_type: MetricAggregationType | null;
  dimension_filters: DimensionFilter[];
  metric: null | string;
  operator: MetricOperatorType | null;
}

export interface NotificationChannelForm {
  channel_type: ChannelTypes | null;
  label: null | string;
}