import { omitProps } from '@linode/ui';

import type {
  CreateAlertDefinitionForm,
  DimensionFilterForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type {
  CreateAlertDefinitionPayload,
  DimensionFilter,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4';

// filtering out the form properties which are not part of the payload
export const filterFormValues = (
  formValues: CreateAlertDefinitionForm
): CreateAlertDefinitionPayload => {
  const values = omitProps(formValues, [
    'serviceType',
    'region',
    'engineType',
    'severity',
    'rule_criteria',
    'trigger_conditions',
  ]);
  const severity = formValues.severity ?? 1;
  const entityIds = formValues.entity_ids;
  const rules = formValues.rule_criteria.rules;
  const triggerConditions = formValues.trigger_conditions;
  return {
    ...values,
    entity_ids: entityIds,
    rule_criteria: { rules: filterMetricCriteriaFormValues(rules) },
    severity,
    trigger_conditions: filterTriggerConditionFormValues(triggerConditions),
  };
};

export const filterMetricCriteriaFormValues = (
  formValues: MetricCriteriaForm[]
): MetricCriteria[] => {
  return formValues.map((rule) => {
    const values = omitProps(rule, ['aggregation_type', 'operator', 'metric']);
    return {
      ...values,
      aggregation_type: rule.aggregation_type ?? 'avg',
      dimension_filters: filterDimensionFilterFormValues(
        rule.dimension_filters
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
      case 's':
        return number;
      case 'm':
        return number * 60;
      case 'h':
        return number * 3600;
      default:
        return number * 0;
    }
  });
};
