import { array, number, object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

export const dimensionFilters = object({
  dimension_label: string().required(fieldErrorMessage),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith', 'in'])
    .required(fieldErrorMessage),
  value: string().required(fieldErrorMessage),
});

export const metricCriteria = object({
  metric: string().required(fieldErrorMessage),
  aggregate_function: string()
    .oneOf(['avg', 'count', 'max', 'min', 'sum'])
    .required(fieldErrorMessage),
  operator: string()
    .oneOf(['eq', 'gt', 'lt', 'gte', 'lte'])
    .required(fieldErrorMessage),
  threshold: number()
    .required(fieldErrorMessage)
    .positive('Enter a positive value.')
    .typeError('The value should be a number.'),
  dimension_filters: array().of(dimensionFilters.defined()).optional(),
});

export const triggerConditionValidation = object({
  criteria_condition: string()
    .oneOf(['ALL'])
    .required('Criteria condition is required'),
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
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      },
    ),
  description: string()
    .max(100, 'Description must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Description cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      },
    )
    .optional(),
  severity: number().oneOf([0, 1, 2, 3]).required(fieldErrorMessage),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.')
      .required(),
  }).required(),
  trigger_conditions: triggerConditionValidation,
  channel_ids: array()
    .of(number().required())
    .required()
    .min(1, 'At least one notification channel is required.'),
  tags: array().of(string().defined()).optional(),
  entity_ids: array().of(string().defined()).optional(),
  regions: array().of(string().defined()).optional(),
  group: string()
    .oneOf(['entity', 'region', 'account'])
    .defined()
    .required(fieldErrorMessage),
});

export const editAlertDefinitionSchema = object({
  channel_ids: array().of(number().required()).optional(),
  label: string()
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      },
    )
    .optional(),
  description: string()
    .max(100, 'Description must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Description cannot start or end with a special character.',
      (value) => {
        return !specialStartEndRegex.test(value ?? '');
      },
    )
    .optional(),
  entity_ids: array().of(string().defined()).optional(),
  regions: array().of(string().defined()).optional(),
  group: string().oneOf(['entity', 'region', 'account']).required(),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.')
      .required(),
  })
    .optional()
    .default(undefined),
  tags: array().of(string().defined()).optional(),
  trigger_conditions: triggerConditionValidation.optional().default(undefined),
  severity: number().oneOf([0, 1, 2, 3]).optional(),
  status: string()
    .oneOf(['enabled', 'disabled', 'in progress', 'failed'])
    .optional(),
});
