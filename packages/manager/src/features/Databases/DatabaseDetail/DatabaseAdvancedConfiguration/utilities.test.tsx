import { databaseEngineConfigFactory } from 'src/factories';

import {
  convertEngineConfigToOptions,
  convertExistingConfigsToArray,
  findConfigItem,
  formatConfigPayload,
  formatConfigValue,
  getConfigAPIError,
  getDefaultConfigValue,
} from './utilities';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  APIError,
  DatabaseEngineConfig,
  DatabaseInstanceAdvancedConfig,
} from '@linode/api-v4';

describe('formatConfigValue', () => {
  it('should return "Enabled" when configValue is "true"', () => {
    const result = formatConfigValue('true');
    expect(result).toBe('Enabled');
  });

  it('should return "Disabled" when configValue is "false"', () => {
    const result = formatConfigValue('false');
    expect(result).toBe('Disabled');
  });

  it('should return " -" when configValue is "undefined"', () => {
    const result = formatConfigValue('undefined');
    expect(result).toBe(' - ');
  });

  it('should return the original configValue for other values', () => {
    const result = formatConfigValue('+03:00');
    expect(result).toBe('+03:00');
  });
});

describe('findConfigItem', () => {
  const mockConfigs: DatabaseEngineConfig =
    databaseEngineConfigFactory.build(1);
  const expectedConfig = {
    category: 'other',
    description:
      'The minimum amount of time in seconds to keep binlog entries before deletion. This may be extended for services that require binlog entries for longer than the default for example if using the MySQL Debezium Kafka connector.',
    example: 600,
    maximum: 86400,
    minimum: 600,
    requires_restart: false,
    type: 'integer',
  };

  const expectedNestedConfig = {
    category: 'mysql',
    description:
      'The number of seconds that the mysqld server waits for a connect packet before responding with Bad handshake',
    example: 10,
    maximum: 3600,
    minimum: 2,
    requires_restart: false,
    type: 'integer',
  };
  it('should return the correct ConfigurationItem for a given targetKey', () => {
    const result = findConfigItem(mockConfigs, 'binlog_retention_period');
    expect(result).toEqual(expectedConfig);
  });

  it('should return the correct ConfigurationItem for a nested key', () => {
    const result = findConfigItem(mockConfigs, 'connect_timeout');
    expect(result).toEqual(expectedNestedConfig);
  });

  it('should return undefined if the targetKey does not exist', () => {
    const result = findConfigItem(mockConfigs, 'non_existing_key');
    expect(result).toBeUndefined();
  });
});

describe('convertExistingConfigsToArray', () => {
  const mockConfigs: DatabaseEngineConfig =
    databaseEngineConfigFactory.build(1);

  const existingConfigs: DatabaseInstanceAdvancedConfig = {
    advanced: {
      connect_timeout: 10,
      default_time_zone: '+03:00',
    },
    binlog_retention_period: 600,
  };

  const expectedOptions: ConfigurationOption[] = [
    {
      category: 'mysql',
      description:
        'The number of seconds that the mysqld server waits for a connect packet before responding with Bad handshake',
      example: 10,
      label: 'connect_timeout',
      maximum: 3600,
      minimum: 2,
      requires_restart: false,
      type: 'integer',
      value: 10,
    },
    {
      category: 'mysql',
      description:
        "Default server time zone as an offset from UTC (from -12:00 to +12:00), a time zone name, or 'SYSTEM' to use the MySQL server default.",
      example: '+03:00',
      label: 'default_time_zone',
      maxLength: 100,
      minLength: 2,
      pattern: '^([-+][\\d:]*|[\\w/]*)$',
      requires_restart: false,
      type: 'string',
      value: '+03:00',
    },
    {
      category: 'other',
      description:
        'The minimum amount of time in seconds to keep binlog entries before deletion. This may be extended for services that require binlog entries for longer than the default for example if using the MySQL Debezium Kafka connector.',
      example: 600,
      label: 'binlog_retention_period',
      maximum: 86400,
      minimum: 600,
      requires_restart: false,
      type: 'integer',
      value: 600,
    },
  ];

  it('should convert configs to array of ConfigurationOptions with label and current value', () => {
    const result = convertExistingConfigsToArray(existingConfigs, mockConfigs);
    expect(result).toEqual(expectedOptions);
  });
});

describe('convertEngineConfigToOptions', () => {
  it('should correctly convert a flat configuration', () => {
    const configs = {
      binlog_retention_period: { type: 'integer' },
      service_log: { type: ['boolean', 'null'] },
    };
    const expectedConfigOptions = [
      {
        category: 'other',
        enum: [],
        label: 'binlog_retention_period',
        type: 'integer',
      },
      {
        category: 'other',
        enum: [],
        label: 'service_log',
        type: ['boolean', 'null'],
      },
    ];
    expect(convertEngineConfigToOptions(configs)).toEqual(
      expectedConfigOptions
    );
  });

  it('should correctly convert a nested configuration', () => {
    const configs = {
      mysql: {
        connect_timeout: { type: 'integer' },
        default_time_zone: { type: 'string' },
      },
    };
    const expectedConfigOptions = [
      {
        category: 'mysql',
        enum: [],
        label: 'connect_timeout',
        type: 'integer',
      },
      {
        category: 'mysql',
        enum: [],
        label: 'default_time_zone',
        type: 'string',
      },
    ];
    expect(convertEngineConfigToOptions(configs)).toEqual(
      expectedConfigOptions
    );
  });
});

describe('formatConfigPayload', () => {
  it('should correctly format a flat configuration', () => {
    const formData = [
      { category: 'other', label: 'binlog_retention_period', value: 600 },
    ];
    const configurations = [
      { category: 'other', label: 'binlog_retention_period' },
    ];
    expect(formatConfigPayload(formData, configurations)).toEqual({
      binlog_retention_period: 600,
    });
  });

  it('should correctly format a nested configuration', () => {
    const formData = [
      { category: '', label: 'connect_timeout', value: 10 },
      { category: 'mysql', label: 'default_time_zone', value: '+03:00' },
    ];
    const configurations = [
      { category: 'mysql', label: 'connect_timeout' },
      { category: 'mysql', label: 'default_time_zone' },
    ];
    expect(formatConfigPayload(formData, configurations)).toEqual({
      mysql: {
        connect_timeout: 10,
        default_time_zone: '+03:00',
      },
    });
  });
});

describe('getDefaultConfigValue', () => {
  it('should return false for boolean type', () => {
    const config: ConfigurationOption = {
      category: '',
      label: '',
      type: 'boolean',
    };
    expect(getDefaultConfigValue(config)).toBe(false);
  });

  it('should return first enum value for string with enum', () => {
    const config: ConfigurationOption = {
      category: '',
      enum: ['option1', 'option2'],
      label: '',
      type: 'string',
    };
    expect(getDefaultConfigValue(config)).toBe('option1');
  });

  it('should return 0 for number type', () => {
    const config: ConfigurationOption = {
      category: '',
      label: '',
      type: 'number',
    };
    expect(getDefaultConfigValue(config)).toBe(0);
  });

  it('should return 0 for integer type', () => {
    const config: ConfigurationOption = {
      category: '',
      label: '',
      type: 'integer',
    };
    expect(getDefaultConfigValue(config)).toBe(0);
  });
});

describe('getConfigAPIError', () => {
  const mockConfig: ConfigurationOption = {
    label: 'connect_timeout',
    category: 'mysql',
    value: 100,
    type: 'number',
  };

  const mockErrors: APIError[] = [
    {
      field: 'engine_config.mysql.connect_timeout',
      reason: 'Invalid value for connect_timeout',
    },
    {
      field: 'engine_config.mysql.default_time_zone',
      reason: 'Invalid value for default_time_zone',
    },
  ];

  it('should return the error reason if a matching error is found', () => {
    const result = getConfigAPIError(mockConfig, mockErrors);
    expect(result).toBe('Invalid value for connect_timeout');
  });

  it('should return undefined if no matching error is found', () => {
    const result = getConfigAPIError(
      { ...mockConfig, label: 'non_existent_config' },
      mockErrors
    );
    expect(result).toBeUndefined();
  });

  it('should return undefined if updateDatabaseError is null', () => {
    const result = getConfigAPIError(mockConfig, null);
    expect(result).toBeUndefined();
  });
});
