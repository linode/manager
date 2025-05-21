import { omitProps } from '@linode/ui';

import type {
  CreateAlertDefinitionForm,
  DimensionFilterForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type {
  AlertServiceType,
  AlertSeverityType,
  CreateAlertDefinitionPayload,
  DimensionFilter,
  EditAlertPayloadWithService,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4';

// filtering out the form properties which are not part of the payload
export const filterFormValues = (
  formValues: CreateAlertDefinitionForm
): CreateAlertDefinitionPayload => {
  const values = omitProps(formValues, [
    'serviceType',
    'severity',
    'rule_criteria',
    'trigger_conditions',
  ]);
  const severity = formValues.severity ?? 1;
  const entityIds = formValues.entity_ids;
  const rules = formValues.rule_criteria.rules;
  const triggerConditions = formValues.trigger_conditions;
  const regions = formValues.regions;
  return {
    ...values,
    entity_ids: entityIds,
    regions,
    rule_criteria: { rules: filterMetricCriteriaFormValues(rules) },
    severity,
    trigger_conditions: filterTriggerConditionFormValues(triggerConditions),
  };
};

/**
 * @param formValues The formValues submitted in the edit alert definition page
 * @param serviceType The service type associated with the alert
 * @param defaultSeverityType The severity type initially associated with the alert
 * @param alertId The id of the alert
 * @returns The edit alert payload filtered from the form properties.
 */
export const filterEditFormValues = (
  formValues: CreateAlertDefinitionForm,
  serviceType: AlertServiceType,
  severity: AlertSeverityType,
  alertId: number
): EditAlertPayloadWithService => {
  const values = omitProps(formValues, [
    'serviceType',
    'severity',
    'rule_criteria',
    'trigger_conditions',
  ]);
  const entityIds = formValues.entity_ids;
  const rules = formValues.rule_criteria.rules;
  const triggerConditions = formValues.trigger_conditions;
  const regions = formValues.regions;
  return {
    ...values,
    alertId,
    entity_ids: entityIds,
    regions,
    rule_criteria: { rules: filterMetricCriteriaFormValues(rules) },
    serviceType,
    severity: formValues.severity ?? severity,
    trigger_conditions: filterTriggerConditionFormValues(triggerConditions),
    type: formValues.type,
    group: formValues.group,
  };
};

export const filterMetricCriteriaFormValues = (
  formValues: MetricCriteriaForm[]
): MetricCriteria[] => {
  return formValues.map((rule) => {
    const values = omitProps(rule, [
      'aggregate_function',
      'operator',
      'metric',
    ]);
    return {
      ...values,
      aggregate_function: rule.aggregate_function ?? 'avg',
      dimension_filters: filterDimensionFilterFormValues(
        rule.dimension_filters ?? []
      ),
      metric: rule.metric ?? '',
      operator: rule.operator ?? 'eq',
    };
  });
};

const filterDimensionFilterFormValues = (
  formValues: DimensionFilterForm[]
): DimensionFilter[] => {
  return formValues.map((dimensionFilter) => {
    return {
      dimension_label: dimensionFilter.dimension_label ?? '',
      operator: dimensionFilter.operator ?? 'eq',
      value: dimensionFilter.value ?? '',
    };
  });
};

const filterTriggerConditionFormValues = (
  formValues: TriggerConditionForm
): TriggerCondition => {
  return {
    ...formValues,
    evaluation_period_seconds: formValues.evaluation_period_seconds ?? 0,
    polling_interval_seconds: formValues.polling_interval_seconds ?? 0,
  };
};

export const convertToSeconds = (secondsList: string[]) => {
  return secondsList.map((second) => {
    const unit = second.slice(-1)[0];
    const number = parseInt(second.slice(0, -1), 10);
    switch (unit) {
      case 'h':
        return number * 3600;
      case 'm':
        return number * 60;
      case 's':
        return number;
      default:
        return number * 0;
    }
  });
};
