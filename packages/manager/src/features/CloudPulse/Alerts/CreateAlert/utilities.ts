import { omitProps } from '@linode/ui';
import { array, object, string } from 'yup';

import type {
  CreateAlertDefinitionForm,
  DimensionFilterForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type {
  CreateAlertDefinitionPayload,
  DimensionFilter,
  EditAlertDefinitionPayload,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4';
import type { AclpAlertServiceTypeConfig } from 'src/featureFlags';
import type { ObjectSchema } from 'yup';

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

export const getValidationSchema = (
  serviceTypeObj: null | string,
  aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[],
  baseSchema: ObjectSchema<
    CreateAlertDefinitionForm | EditAlertDefinitionPayload
  >
): ObjectSchema<CreateAlertDefinitionForm | EditAlertDefinitionPayload> => {
  const maxSelectionCount = aclpAlertServiceTypeConfig.find(
    ({ serviceType }) => serviceTypeObj === serviceType
  )?.maxResourceSelectionCount;

  return maxSelectionCount === undefined
    ? baseSchema
    : baseSchema.concat(
        object({
          entity_ids: array()
            .of(string())
            .max(
              maxSelectionCount,
              `More than ${maxSelectionCount} resources selected.`
            ),
        }) as ObjectSchema<
          CreateAlertDefinitionForm | EditAlertDefinitionPayload
        >
      );
};
