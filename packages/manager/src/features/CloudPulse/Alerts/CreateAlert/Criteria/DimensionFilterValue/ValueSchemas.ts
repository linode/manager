import { string } from 'yup';

import {
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_HELPER_TEXT,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LEADING_ZERO_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from 'src/features/CloudPulse/Utils/constants';

import {
  CONFIG_ERROR_MESSAGE,
  CONFIG_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  CONFIGS_ERROR_MESSAGE,
  CONFIGS_HELPER_TEXT,
  PORT_HELPER_TEXT,
  PORTS_TRAILING_COMMA_ERROR_MESSAGE,
} from '../../../constants';

const fieldErrorMessage = 'This field is required.';
const DECIMAL_PORT_REGEX = /^[1-9]\d{0,4}$/;
const LEADING_ZERO_PORT_REGEX = /^0\d+/;
const CONFIG_NUMBER_REGEX = /^\d+$/;

// Validation schema for a single input port
const singlePortSchema = string().test(
  'validate-single-port',
  PORT_HELPER_TEXT,
  function (value) {
    if (!value || typeof value !== 'string') {
      return this.createError({ message: fieldErrorMessage });
    }

    if (LEADING_ZERO_PORT_REGEX.test(value)) {
      return this.createError({
        message: PORTS_LEADING_ZERO_ERROR_MESSAGE,
      });
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

      if (LEADING_ZERO_PORT_REGEX.test(trimmedPort)) {
        return this.createError({
          message: PORTS_LEADING_ZERO_ERROR_MESSAGE,
        });
      }
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
const singleConfigSchema = string()
  .max(100, 'Value must be 100 characters or less.')
  .test(
    'validate-single-config-schema',
    CONFIG_ERROR_MESSAGE,
    function (value) {
      if (!value || typeof value !== 'string') {
        return this.createError({ message: fieldErrorMessage });
      }

      if (!CONFIG_NUMBER_REGEX.test(value)) {
        return this.createError({ message: CONFIG_ERROR_MESSAGE });
      }
      return true;
    }
  );

const multipleConfigSchema = string()
  .max(100, 'Value must be 100 characters or less.')
  .test(
    'validate-multi-config-schema',
    CONFIGS_ERROR_MESSAGE,
    function (value) {
      if (!value || typeof value !== 'string') {
        return this.createError({ message: fieldErrorMessage });
      }
      if (value.includes(' ')) {
        return this.createError({ message: CONFIGS_ERROR_MESSAGE });
      }

      if (value.trim().endsWith(',')) {
        return this.createError({
          message: PORTS_TRAILING_COMMA_ERROR_MESSAGE,
        });
      }

      if (value.trim().startsWith(',')) {
        return this.createError({ message: PORTS_LEADING_COMMA_ERROR_MESSAGE });
      }

      if (value.trim().includes(',,')) {
        return this.createError({
          message: CONFIG_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
        });
      }
      if (value.includes('.')) {
        return this.createError({ message: CONFIGS_HELPER_TEXT });
      }

      const rawSegments = value.split(',');
      // Check for empty segments
      if (rawSegments.some((segment) => segment.trim() === '')) {
        return this.createError({
          message: CONFIG_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
        });
      }
      for (const configId of rawSegments) {
        const trimmedConfigId = configId.trim();

        if (!CONFIG_NUMBER_REGEX.test(trimmedConfigId)) {
          return this.createError({ message: CONFIG_ERROR_MESSAGE });
        }
      }
      return true;
    }
  );

const baseValueSchema = string()
  .required(fieldErrorMessage)
  .nullable()
  .test('nonNull', fieldErrorMessage, (value) => value !== null);

interface GetValueSchemaParams {
  dimensionLabel: string;
  operator: string;
}

export const getDimensionFilterValueSchema = ({
  dimensionLabel,
  operator,
}: GetValueSchemaParams) => {
  if (dimensionLabel === 'port') {
    const portSchema =
      operator === 'in' ? commaSeparatedPortListSchema : singlePortSchema;
    return portSchema.concat(baseValueSchema);
  }
  if (dimensionLabel === 'config_id') {
    const configSchema =
      operator === 'in' ? multipleConfigSchema : singleConfigSchema;
    return configSchema.concat(baseValueSchema);
  }

  return baseValueSchema;
};
