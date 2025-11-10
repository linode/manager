import {
  createAlertDefinitionSchema,
  dimensionFilters,
  metricCriteria,
  triggerConditionValidation,
} from '@linode/validation';
import { array, lazy, mixed, number, object, string } from 'yup';

import { getDimensionFilterValueSchema } from './Criteria/DimensionFilterValue/ValueSchemas';

import type { AssociatedEntityType } from '../../shared/types';
import type { AlertSeverityType, CloudPulseServiceType } from '@linode/api-v4';
import type { AlertDefinitionScope } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

export const dimensionFiltersSchema = dimensionFilters.concat(
  object({
    dimension_label: string()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    operator: string()
      .oneOf(['eq', 'neq', 'startswith', 'endswith', 'in'])
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    value: lazy((_, context) => {
      const { dimension_label, operator } = context.parent;
      return getDimensionFilterValueSchema({
        dimensionLabel: dimension_label,
        operator,
      }).defined();
    }),
  })
);

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
    entity_ids: array().of(string().defined()).optional(),
    entity_type: mixed<AssociatedEntityType>()
      .oneOf(['linode', 'nodebalancer'])
      .nullable()
      .when('serviceType', {
        is: 'firewall',
        then: (schema) =>
          schema
            .required(fieldErrorMessage)
            .test('nonNull', fieldErrorMessage, (value) => value !== null),
        otherwise: (schema) => schema.optional(),
      }),
    rule_criteria: object({
      rules: array()
        .of(metricCriteriaSchema)
        .required()
        .min(1, 'At least one metric criteria is required.'),
    }).required(),
    serviceType: mixed<CloudPulseServiceType>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    severity: mixed<AlertSeverityType>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    trigger_conditions: triggerConditionSchema,
    regions: array().of(string().defined()).optional(),
    scope: mixed<AlertDefinitionScope>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
