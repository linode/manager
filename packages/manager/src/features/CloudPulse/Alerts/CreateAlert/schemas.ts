import { type AlertSeverityType } from '@linode/api-v4';
import {
  createAlertDefinitionSchema,
  dimensionFilters,
  metricCriteria,
  triggerConditionValidation,
} from '@linode/validation';
import { array, mixed, number, object, string } from 'yup';

import {
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_HELPER_TEXT,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from '../../Utils/constants';
import { PORTS_TRAILING_COMMA_ERROR_MESSAGE } from '../constants';

import type { AlertDefinitionGroup, AlertDefinitionType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

const DECIMAL_PORT_REGEX = /^[1-9]\d{0,4}$/;

// Validation schema for a single input port
const singlePortSchema = string().test(
  'validate-single-port',
  PORTS_ERROR_MESSAGE,
  function (value) {
    if (!value || typeof value !== 'string') {
      return this.createError({ message: fieldErrorMessage });
    }

    if (!DECIMAL_PORT_REGEX.test(value)) {
      return this.createError({ message: PORTS_RANGE_ERROR_MESSAGE });
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
  PORTS_HELPER_TEXT,
  function (value) {
    if (!value || typeof value !== 'string') {
      return this.createError({ message: fieldErrorMessage });
    }

    if (value.includes(' ')) {
      return this.createError({ message: PORTS_ERROR_MESSAGE });
    }

    if (value.trim().endsWith(',')) {
      return this.createError({ message: PORTS_TRAILING_COMMA_ERROR_MESSAGE });
    }

    if (value.trim().startsWith(',')) {
      return this.createError({ message: PORTS_LEADING_COMMA_ERROR_MESSAGE });
    }

    if (value.includes('.')) {
      return this.createError({ message: PORTS_HELPER_TEXT });
    }

    const rawSegments = value.split(',');

    // Check for empty segments (consecutive commas, or commas with just spaces)
    if (rawSegments.some((segment) => segment.trim() === '')) {
      return this.createError({
        message: PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
      });
    }

    const ports = rawSegments.map((p) => p.trim());

    if (ports.length > 15) {
      return this.createError({
        message: PORTS_LIMIT_ERROR_MESSAGE,
      });
    }
    for (const port of ports) {
      const trimmedPort = port.trim();
      if (!DECIMAL_PORT_REGEX.test(trimmedPort)) {
        return this.createError({ message: PORTS_HELPER_TEXT });
      }

      const num = Number(trimmedPort);
      if (!Number.isInteger(num) || num < 1 || num > 65535) {
        return this.createError({ message: PORTS_RANGE_ERROR_MESSAGE });
      }
    }

    return true;
  }
);

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
