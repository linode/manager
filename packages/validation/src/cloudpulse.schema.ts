import { array, number, object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

const dimensionFilters = object({
  dimension_label: string().required(fieldErrorMessage),
  operator: string().required(fieldErrorMessage),
  value: string().required(fieldErrorMessage),
});

const metricCriteria = object({
  metric: string().required(fieldErrorMessage),
  aggregate_function: string().required(fieldErrorMessage),
  operator: string().required(fieldErrorMessage),
  threshold: number()
    .required(fieldErrorMessage)
    .positive("Enter a positive value.")
    .typeError('The value should be a number.'),
  dimension_filters: array().of(dimensionFilters).notRequired(),
});

const triggerConditionValidation = object({
  polling_interval_seconds: number().required(fieldErrorMessage),
  evaluation_period_seconds: number().required(fieldErrorMessage),
  trigger_occurrences: number()
    .required(fieldErrorMessage)
    .positive('Enter a positive value.')
    .typeError('The value should be a number.'),
});

const specialStartEndRegex = /^[^a-zA-Z0-9]/;
export const createAlertDefinitionSchema = object({
  label: string()
    .required(fieldErrorMessage)
    .matches(
      /^[^*#&+:<>"?@%{}\\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      }
    ),
  description: string()
    .max(100, 'Description must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Description cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      }
    )
    .optional(),
  severity: number().oneOf([0, 1, 2, 3]).required(fieldErrorMessage),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.'),
  }),
  trigger_conditions: triggerConditionValidation,
  channel_ids: array()
    .of(number())
    .min(1, 'At least one notification channel is required.'),
  tags: array().of(string()).notRequired(),
});
