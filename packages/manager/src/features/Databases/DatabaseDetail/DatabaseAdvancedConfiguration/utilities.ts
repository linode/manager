import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  ConfigCategoryValues,
  ConfigurationItem,
  ConfigValue,
  DatabaseEngineConfig,
  DatabaseInstanceAdvancedConfig,
} from '@linode/api-v4';

type ConfigTree = Record<
  string,
  ConfigurationItem | Record<string, ConfigurationItem>
>;

const CONFIG_VALUE_MAP: Record<string, string> = {
  true: 'Enabled',
  false: 'Disabled',
  undefined: ' - ',
} as const;

export const isTopLevelCategory = (category: string) =>
  ['other', 'valkey'].includes(category);

// Aiven does not provide a parent category for valkey configs so we need to check the label
const getCategoryFromFlatKey = (key: string): string =>
  key.startsWith('valkey') ? 'valkey' : 'other';

/**
 * Formats the provided config value into a more user-friendly representation.
 *
 * @param {string} configValue - The configuration value to be formatted.
 * @returns {string} - The formatted string based on the configValue.
 */
export const formatConfigValue = (configValue: string) =>
  CONFIG_VALUE_MAP[configValue] ?? configValue;

/**
 * Converts a nested database engine configuration into a flat array of configuration options.
 *
 * @param allConfigs
 * @returns An array of structured configuration options.
 */
export const convertEngineConfigToOptions = (
  allConfigs: DatabaseEngineConfig | undefined
) => {
  if (!allConfigs) {
    return [];
  }
  const options: ConfigurationOption[] = Object.entries(allConfigs).flatMap(
    ([key, value]) => {
      if (typeof value !== 'object') return [];

      if ('type' in value) {
        const category = getCategoryFromFlatKey(key);
        return [{ ...value, category, enum: value.enum ?? [], label: key }];
      }

      return Object.entries(value).map(([subKey, subValue]) => ({
        ...subValue,
        category: key,
        enum: subValue.enum ?? [],
        label: subKey,
      }));
    }
  );

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
  configs: ConfigTree | undefined,
  targetKey: string
): ConfigurationOption | undefined => {
  for (const [key, value] of Object.entries(configs ?? {})) {
    if (key === targetKey) {
      return {
        ...value,
        category: getCategoryFromFlatKey(key),
      } as ConfigurationOption;
    }

    if (typeof value === 'object' && value !== null) {
      const found = findConfigItem(value as ConfigTree, targetKey);
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
  const _configs: [string, ConfigValue][] = Object.entries(configs).flatMap(
    ([key, value]) =>
      typeof value === 'object' && value !== null
        ? Object.entries(value)
        : [[key, value]]
  );

  return _configs.flatMap(([key, value]) => {
    const foundConfig = findConfigItem(allConfigs, key);
    return foundConfig
      ? [{ ...foundConfig, category: foundConfig.category, label: key, value }]
      : [];
  });
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
  const formValues = new Map(
    formData.map(({ label, value }) => [label, value])
  );

  return configurations.reduce<DatabaseInstanceAdvancedConfig>(
    (acc, { category, label }) => {
      const value = formValues.get(label);
      if (value === undefined) return acc;

      if (isTopLevelCategory(category)) {
        acc[label] = value;
      } else {
        acc[category] ??= {} as ConfigCategoryValues;
        (acc[category] as ConfigCategoryValues)[label] = value;
      }

      return acc;
    },
    {}
  );
};

export const isConfigBoolean = (config: ConfigurationOption) => {
  return (
    config?.type === 'boolean' ||
    (Array.isArray(config?.type) &&
      config?.type.some((type) => type === 'boolean'))
  );
};

export const isConfigString = (config: ConfigurationOption) => {
  return (
    config?.type === 'string' ||
    (Array.isArray(config?.type) &&
      config?.type.some((type) => type === 'string'))
  );
};

export const isConfigNumber = (config: ConfigurationOption) => {
  return (
    config?.type === 'number' ||
    config?.type === 'integer' ||
    (typeof config?.value !== 'boolean' &&
      Array.isArray(config?.type) &&
      config.type.some((type) => type === 'integer' || type === 'number'))
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
    : config.enum && isConfigString(config)
      ? (config.enum?.[0] ?? '')
      : config?.type === 'number' || config?.type === 'integer'
        ? (config.minimum ?? 0)
        : '';
};

/**
 * Determines if a restart is required based on dirty fields.
 */
export const getSaveBtnLabel = (
  currentConfigs: ConfigurationOption[],
  initialConfigs: ConfigurationOption[]
): string => {
  const initialByLabel = new Map(initialConfigs.map((c) => [c.label, c]));

  const requiresRestart = currentConfigs.some((current) => {
    const initial = initialByLabel.get(current.label);
    const hasChanged = !initial || initial.value !== current.value;
    return hasChanged && current.requires_restart;
  });

  return requiresRestart ? 'Save and Restart Service' : 'Save';
};
