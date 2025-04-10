import {
  createAlertDefinitionSchema,
  metricCriteria,
  triggerConditionValidation,
} from '@linode/validation';
import { array, mixed, number, object, string } from 'yup';

import type { AlertSeverityType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

export const dimensionFiltersSchema = object({
  dimension_label: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith'])
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  value: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
});

export const metricCriteriaSchema = metricCriteria.concat(
  object({
    aggregate_function: string()
      .oneOf(['avg', 'sum', 'min', 'max', 'count'])
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),

    dimension_filters: array().of(dimensionFiltersSchema).required(),

    metric: string()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),

    operator: string()
      .oneOf(['eq', 'gt', 'lt', 'gte', 'lte'])
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
  })
);

export const triggerConditionSchema = triggerConditionValidation.concat(
  object({
    evaluation_period_seconds: number()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    polling_interval_seconds: number()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
  })
);

export const alertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    entity_ids: array().of(string().defined()).required(),
    rule_criteria: object({
      rules: array()
        .of(metricCriteriaSchema)
        .required()
        .min(1, 'At least one metric criteria is required.'),
    }).required(),
    serviceType: string()
      .oneOf(['linode', 'dbaas'])
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    severity: mixed<AlertSeverityType>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    trigger_conditions: triggerConditionSchema,
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
