import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  APIError,
  ConfigCategoryValues,
  ConfigurationItem,
  DatabaseEngineConfig,
  DatabaseInstanceAdvancedConfig,
} from '@linode/api-v4';

/**
 * Formats the provided config value into a more user-friendly representation.
 * - If the value is 'true', it will be displayed as 'Enabled'.
 * - If the value is 'false', it will be displayed as 'Disabled'.
 * - If the value is 'undefined', it will be displayed as ' - '.
 * - Otherwise, the original value will be returned as-is.
 *
 * @param {string} configValue - The configuration value to be formatted.
 * @returns {string} - The formatted string based on the configValue.
 */
export const formatConfigValue = (configValue: string) =>
  configValue === 'true'
    ? 'Enabled'
    : configValue === 'false'
      ? 'Disabled'
      : configValue === 'undefined'
        ? ' - '
        : configValue;

/**
 * Converts a nested database engine configuration into a flat array of configuration options.
 *
 * @param allConfigs
 * @returns An array of structured configuration options.
 */
export const convertEngineConfigToOptions = (
  allConfigs: DatabaseEngineConfig | undefined
) => {
  const options: ConfigurationOption[] = [];

  const processConfig = (
    config: Record<
      string,
      ConfigurationItem | Record<string, ConfigurationItem>
    >,
    parentCategory: string = ''
  ) => {
    for (const key in config) {
      const value = config[key] as ConfigurationItem;
      if (typeof value === 'object') {
        // If it has "type" property, add option to the list
        if ('type' in value) {
          // If parentCategory is empty, use 'Other' as the category
          const category = parentCategory || 'other';
          options.push({
            ...value,
            category,
            enum: value.enum ?? [],
            label: key,
            type: value.type,
          });
        }
        // Else, it's a nested category, so recurse
        else {
          processConfig(value as Record<string, ConfigurationItem>, key);
        }
      }
    }
  };

  if (allConfigs !== undefined) {
    processConfig(allConfigs);
  }

  return options;
};

/**
 * Recursively searches for a configuration item by its key within a nested configuration object.
 *
 * @param configObject
 * @param targetKey
 * @returns The found configuration option or `undefined` if not found.
 */
export const findConfigItem = (
  configs:
    | Record<string, ConfigurationItem | Record<string, ConfigurationItem>>
    | undefined,
  targetKey: string
): ConfigurationOption | undefined => {
  for (const key in configs) {
    const value = configs[key];

    if (key === targetKey) {
      return { ...value, category: 'other' } as ConfigurationOption;
    }

    if (typeof value === 'object' && value !== null) {
      const found = findConfigItem(
        value as Record<string, ConfigurationItem>,
        targetKey
      );
      if (found) return { ...found, category: key };
    }
  }

  return undefined;
};

/**
 * Converts existing database configurations into an array of configuration options.
 *
 * @param configs
 * @param allConfigs
 * @returns An array of structured configuration options with metadata from `allConfigs`.
 */
export const convertExistingConfigsToArray = (
  configs: DatabaseInstanceAdvancedConfig,
  allConfigs: DatabaseEngineConfig | undefined
): ConfigurationOption[] => {
  const options: ConfigurationOption[] = [];

  for (const key in configs) {
    const value = configs[key];

    if (typeof value === 'object' && value !== null) {
      for (const subKey in value) {
        const subValue = value[subKey];

        const foundConfig = findConfigItem(allConfigs, subKey);
        if (foundConfig) {
          options.push({
            ...foundConfig,
            category: foundConfig.category || '',
            label: subKey,
            value: subValue,
          });
        }
      }
    } else {
      const foundConfig = findConfigItem(allConfigs, key);
      if (foundConfig) {
        options.push({
          ...foundConfig,
          category: foundConfig.category || '',
          label: key,
          value,
        });
      }
    }
  }
  return options;
};

/**
 * Formats the configuration payload by organizing form data into categorized fields.
 *
 * @param formData
 * @param configurations
 * @returns A structured object where configurations are grouped by category.
 */
export const formatConfigPayload = (
  formData: ConfigurationOption[],
  configurations: ConfigurationOption[]
) => {
  const formattedConfigData: DatabaseInstanceAdvancedConfig = {};

  configurations.forEach(({ category, label }) => {
    // Find the matching config from the formData
    const formConfig = formData.find((config) => config.label === label);

    if (formConfig && formConfig.value !== undefined) {
      if (category === 'other') {
        formattedConfigData[label] = formConfig.value;
      } else {
        if (!formattedConfigData[category]) {
          formattedConfigData[category] = {} as ConfigCategoryValues;
        }
        (formattedConfigData[category] as ConfigCategoryValues)[label] =
          formConfig.value;
      }
    }
  });

  return formattedConfigData;
};

export const isConfigBoolean = (config: ConfigurationOption) => {
  return (
    config?.type === 'boolean' ||
    (Array.isArray(config?.type) && config?.type.includes('boolean'))
  );
};

export const isConfigStringWithEnum = (config: ConfigurationOption) => {
  return (
    (config?.type === 'string' && config.enum) ||
    (Array.isArray(config?.type) &&
      config?.type.includes('string') &&
      config.enum)
  );
};

/**
 * Determines the default value for a configuration item based on its type.
 *
 * @param config - The configuration object
 * @returns - The default value for the given configuration
 */
export const getDefaultConfigValue = (config: ConfigurationOption) => {
  return isConfigBoolean(config)
    ? false
    : isConfigStringWithEnum(config)
      ? (config.enum?.[0] ?? '')
      : config?.type === 'number' || config?.type === 'integer'
        ? (config.minimum ?? 0)
        : '';
};

/**
 * Finds the API error for a specific configuration.
 */
export const getConfigAPIError = (
  config: ConfigurationOption,
  updateDatabaseError: APIError[] | null
): string | undefined => {
  if (!updateDatabaseError || !Array.isArray(updateDatabaseError)) {
    return undefined;
  }

  const error = updateDatabaseError.find(
    (error) =>
      error.field === `engine_config.${config.category}.${config.label}`
  );

  return error?.reason;
};

/**
 * Determines if a restart is required based on dirty fields.
 */
export const hasRestartCluster = (
  currentConfigs: ConfigurationOption[],
  initialConfigs: ConfigurationOption[]
): string => {
  const requiresRestart = currentConfigs.some((currentConfig) => {
    const initialConfig = initialConfigs.find(
      (item) => item.label === currentConfig.label
    );

    const isNewConfig = !initialConfig;
    const hasChangedValue =
      initialConfig && initialConfig.value !== currentConfig.value;

    return (isNewConfig || hasChangedValue) && currentConfig.requires_restart;
  });

  return requiresRestart ? 'Save and Restart Service' : 'Save';
};
