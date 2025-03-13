import {
  createAlertDefinitionSchema,
  metricCriteria,
  triggerConditionValidation,
} from '@linode/validation';
import { array, mixed, number, object, string } from 'yup';

import type { AlertSeverityType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

export const dimensionFiltersUpdated = object({
  dimension_label: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('emptyTest', fieldErrorMessage, (value) => value !== null),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith'])
    .required(fieldErrorMessage)
    .nullable()
    .test('emptyTest', fieldErrorMessage, (value) => value !== null),
  value: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('emptyTest', fieldErrorMessage, (value) => value !== null),
});

export const metricCriteriaUpdated = metricCriteria.concat(
  object({
    aggregate_function: string()
      .oneOf(['avg', 'sum', 'min', 'max', 'count'])
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),

    dimension_filters: array()
      .of(dimensionFiltersUpdated)
      .optional()
      .default([]),

    metric: string()
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),

    operator: string()
      .oneOf(['eq', 'gt', 'lt', 'gte', 'lte'])
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),
  })
);

export const triggerConditionValidationUpdated = triggerConditionValidation.concat(
  object({
    evaluation_period_seconds: number()
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),
    polling_interval_seconds: number()
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),
  })
);

export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    engineType: string().defined().nullable(),
    region: string().defined(),
    rule_criteria: object({
      rules: array()
        .of(metricCriteriaUpdated)
        .min(1, 'At least one metric criteria is required.')
        .default([]),
    }),
    serviceType: string()
      .oneOf(['linode', 'dbaas'])
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),
    severity: mixed<AlertSeverityType>()
      .required(fieldErrorMessage)
      .nullable()
      .test('emptyTest', fieldErrorMessage, (value) => value !== null),
    trigger_conditions: triggerConditionValidationUpdated,
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
