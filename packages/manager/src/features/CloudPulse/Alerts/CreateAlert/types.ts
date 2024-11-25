import type {
  AlertServiceType,
  AlertSeverityType,
  CreateAlertDefinitionPayload,
  MetricAggregationType,
  MetricCriteria,
  MetricOperatorType,
} from '@linode/api-v4';

export interface CreateAlertDefinitionForm
  extends Omit<CreateAlertDefinitionPayload, 'severity'> {
  engine_type: null | string;
  region: string;
  service_type: AlertServiceType | null;
  severity: AlertSeverityType | null;
}

export interface MetricCriteriaForm
  extends Omit<MetricCriteria, 'aggregation_type' | 'operator'> {
  aggregation_type: MetricAggregationType | null;
  operator: MetricOperatorType | null;
}
