import type {
  AlertDefinitionGroup,
  AlertDefinitionType,
  AlertServiceType,
  AlertSeverityType,
  ChannelType,
  CreateAlertDefinitionPayload,
  DimensionFilter,
  DimensionFilterOperatorType,
  MetricAggregationType,
  MetricCriteria,
  MetricOperatorType,
  TriggerCondition,
} from '@linode/api-v4';

export interface CreateAlertDefinitionForm
  extends Omit<
    CreateAlertDefinitionPayload,
    'rule_criteria' | 'severity' | 'trigger_conditions'
  > {
  entity_ids?: string[];
  group: AlertDefinitionGroup | null;
  regions?: string[];
  rule_criteria: {
    rules: MetricCriteriaForm[];
  };
  serviceType: AlertServiceType | null;
  severity: AlertSeverityType | null;
  trigger_conditions: TriggerConditionForm;
  type: AlertDefinitionType | null;
}

export interface MetricCriteriaForm
  extends Omit<
    MetricCriteria,
    'aggregate_function' | 'dimension_filters' | 'metric' | 'operator'
  > {
  aggregate_function: MetricAggregationType | null;
  dimension_filters: DimensionFilterForm[];
  metric: null | string;
  operator: MetricOperatorType | null;
}

export interface DimensionFilterForm
  extends Omit<DimensionFilter, 'dimension_label' | 'operator' | 'value'> {
  dimension_label: null | string;
  operator: DimensionFilterOperatorType | null;
  value: null | string;
}

export interface TriggerConditionForm
  extends Omit<
    TriggerCondition,
    'evaluation_period_seconds' | 'polling_interval_seconds'
  > {
  evaluation_period_seconds: null | number;
  polling_interval_seconds: null | number;
}

export interface NotificationChannelForm {
  channel_type: ChannelType | null;
  label: null | string;
}
