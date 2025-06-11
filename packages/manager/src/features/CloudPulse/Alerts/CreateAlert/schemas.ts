import { type AlertSeverityType } from '@linode/api-v4';
import {
  createAlertDefinitionSchema,
  metricCriteria,
  triggerConditionValidation,
} from '@linode/validation';
import { array, mixed, number, object, string } from 'yup';

import type { AlertDefinitionGroup, AlertDefinitionType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';
const PORTS_ERROR_MESSAGE = 'Input must be an integer.';
const MULTIPLE_PORTS_ERROR_MESSAGE =
  'Input must be an integer or comma-separated list of integers.';
const PORTS_RANGE_ERROR_MESSAGE = 'Must be 1-65535';
const PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE =
  'Consecutive commas are not allowed.';
const PORTS_LEADING_COMMA_ERROR_MESSAGE = 'Ports must not have leading commas.';
const PORTS_TRAILING_COMMA_ERROR_MESSAGE =
  'Ports must not have trailing commas.';
const DUPLICATE_PORTS_ERROR_MESSAGE = 'Duplicate ports are not allowed';

// Validation schema for a single input port
const singlePortSchema = string().test(
  'validate-single-port',
  PORTS_ERROR_MESSAGE,
  function (value) {
    if (!value || typeof value !== 'string') return false;

    if (value.includes(',') || value.includes('.') || isNaN(Number(value))) {
      return this.createError({ message: PORTS_ERROR_MESSAGE });
    }

    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 65535) {
      return this.createError({ message: PORTS_RANGE_ERROR_MESSAGE });
    }

    return true;
  }
);

// Validation schema for a multiple comma-separated ports
const commaSeparatedPortListSchema = string().test(
  'validate-port-list',
  MULTIPLE_PORTS_ERROR_MESSAGE,
  function (value) {
    if (!value || typeof value !== 'string') return false;

    if (value.trim().startsWith(',')) {
      return this.createError({ message: PORTS_LEADING_COMMA_ERROR_MESSAGE });
    }

    if (value.includes('.')) {
      return this.createError({ message: MULTIPLE_PORTS_ERROR_MESSAGE });
    }

    if (value.trim().endsWith(',')) {
      return this.createError({ message: PORTS_TRAILING_COMMA_ERROR_MESSAGE });
    }
    const rawSegments = value.split(',');

    // Check for empty segments (consecutive commas, or commas with just spaces)
    if (rawSegments.some((segment) => segment.trim() === '')) {
      return this.createError({
        message: PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
      });
    }

    const ports = rawSegments.map((p) => p.trim());

    const unique = new Set(ports);
    if (unique.size !== ports.length) {
      return this.createError({
        message: DUPLICATE_PORTS_ERROR_MESSAGE,
      });
    }

    for (const port of ports) {
      const num = Number(port);
      if (isNaN(num)) {
        return this.createError({ message: MULTIPLE_PORTS_ERROR_MESSAGE });
      }

      if (!Number.isInteger(num) || num < 1 || num > 65535) {
        return this.createError({ message: PORTS_RANGE_ERROR_MESSAGE });
      }
    }

    return true;
  }
);

export const dimensionFiltersSchema = object({
  dimension_label: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith', 'in'])
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  value: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null)
    .when(
      ['dimension_label', 'operator'],
      ([dimensionLabel, operator], schema) => {
        if (dimensionLabel === 'port' && operator === 'in') {
          return commaSeparatedPortListSchema;
        }

        if (dimensionLabel === 'port' && operator !== 'in') {
          return singlePortSchema;
        }

        return schema;
      }
    ),
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
    entity_ids: array().of(string().defined()),
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
    type: mixed<AlertDefinitionType>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
    regions: array().of(string().defined()),
    scope: mixed<AlertDefinitionGroup>()
      .required(fieldErrorMessage)
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null),
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
