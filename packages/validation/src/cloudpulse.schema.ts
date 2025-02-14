import { array, number, object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

const dimensionFilters = object({
  dimension_label: string().required('Label for the filter is required.'),
  operator: string().required(fieldErrorMessage),
  value: string().required(fieldErrorMessage),
});

const metricCriteria = object({
  metric: string().required(fieldErrorMessage),
  aggregate_function: string().required(fieldErrorMessage),
  operator: string().required(fieldErrorMessage),
  threshold: number()
    .required(fieldErrorMessage)
    .min(0, "The value can't be negative.")
    .typeError('The value should be a number.'),
  dimension_filters: array().of(dimensionFilters).notRequired(),
});

const triggerConditionValidation = object({
  polling_interval_seconds: number().required(fieldErrorMessage),
  evaluation_period_seconds: number().required(fieldErrorMessage),
  trigger_occurrences: number()
    .required(fieldErrorMessage)
    .positive("The value can't be 0.")
    .typeError(fieldErrorMessage),
});

export const createAlertDefinitionSchema = object({
  label: string().required(fieldErrorMessage),
  description: string().optional(),
  severity: number().oneOf([0, 1, 2, 3]).required(fieldErrorMessage),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.'),
  }),
  trigger_conditions: triggerConditionValidation,
  channel_ids: array(number()),
  tags: array().of(string()).notRequired(),
});
