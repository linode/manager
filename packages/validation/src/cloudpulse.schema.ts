import { array, number, object, string } from 'yup';

const dimensionFilters = object({
  dimension_label: string().required('Label is required for the filter.'),
  operator: string().required('Operator is required.'),
  value: string().required('Value is required.'),
});

const metricCriteria = object({
  metric: string().required('Metric Data Field is required.'),
  aggregation_type: string().required('Aggregation type is required.'),
  operator: string().required('Criteria Operator is required.'),
  threshold: number()
    .required('Threshold value is required.')
    .min(0, 'Threshold value cannot be negative.'),
  dimension_filters: array().of(dimensionFilters).notRequired(),
});

const triggerCondition = object({
  criteria_condition: string().required('Criteria condition is required.'),
  polling_interval_seconds: string().required('Polling Interval is required.'),
  evaluation_period_seconds: string().required(
    'Evaluation Period is required.'
  ),
  trigger_occurrences: number()
    .required('Trigger Occurrences is required.')
    .positive('Number of occurrences must be greater than zero.'),
});

export const createAlertDefinitionSchema = object({
  label: string().required('Name is required.'),
  description: string().optional(),
  severity: string().required('Severity is required.'),
  entity_ids: array().of(string()).min(1, 'At least one resource is needed.'),
  criteria: array()
    .of(metricCriteria)
    .min(1, 'At least one metric criteria is needed.'),
  triggerCondition,
});
