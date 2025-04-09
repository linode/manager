import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { DateTime } from 'luxon';

import { useFlags } from 'src/hooks/useFlags';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';

import type { ConfigurationOption } from './DatabaseDetail/DatabaseAdvancedConfiguration/DatabaseConfigurationSelect';
import type {
  ConfigCategoryValues,
  ConfigurationItem,
  DatabaseEngine,
  DatabaseFork,
  DatabaseEngineConfig,
  DatabaseInstance,
  DatabaseInstanceAdvancedConfig,
  Engine,
  PendingUpdates,
} from '@linode/api-v4';

export interface IsDatabasesEnabled {
  isDatabasesEnabled: boolean;
  isDatabasesV2Beta: boolean;
  isDatabasesV2Enabled: boolean;
  isDatabasesV2GA: boolean;
  /**
   * Temporary variable to be removed post GA release
   */
  isUserExistingBeta: boolean;
  /**
   * Temporary variable to be removed post GA release
   */
  isUserNewBeta: boolean;
}

/**
 * A hook to determine if Databases should be visible to the user.
 *
 * For unrestricted users, databases will show when
 * The user has the `Managed Databases` account capability.
 *
 * For users who don't have permission to load /v4/account
 * (who are restricted users without account read access),
 * we must check if they can load Database Types as a workaround.
 * If these users can successfully fetch database types, we will
 * show databases.
 */
export const useIsDatabasesEnabled = (): IsDatabasesEnabled => {
  const flags = useFlags();
  const hasV2Flag: boolean = !!flags.dbaasV2?.enabled;
  const hasV2BetaFlag: boolean = hasV2Flag && flags.dbaasV2?.beta === true;
  const hasV2GAFlag: boolean = hasV2Flag && flags.dbaasV2?.beta === false;

  const { data: account } = useAccount();
  // If we don't have permission to GET /v4/account,
  // we need to try fetching Database engines to know if the user has databases enabled.
  const checkRestrictedUser = !account;

  const { data: types } = useDatabaseTypesQuery(
    { platform: 'rdbms-default' },
    checkRestrictedUser
  );

  const { data: legacyTypes } = useDatabaseTypesQuery(
    { platform: 'rdbms-legacy' },
    checkRestrictedUser
  );

  if (account) {
    const isDatabasesV1Enabled = isFeatureEnabledV2(
      'Managed Databases',
      true,
      account?.capabilities ?? []
    );

    const isDatabasesV2BetaEnabled =
      isFeatureEnabledV2(
        'Managed Databases Beta',
        hasV2Flag,
        account?.capabilities ?? []
      ) && hasV2BetaFlag;

    const isDatabasesV2GAEnabled =
      isFeatureEnabledV2(
        'Managed Databases',
        hasV2Flag,
        account?.capabilities ?? []
      ) && hasV2GAFlag;

    return {
      isDatabasesEnabled:
        isDatabasesV1Enabled ||
        isDatabasesV2BetaEnabled ||
        isDatabasesV2GAEnabled,

      isDatabasesV2Beta: isDatabasesV2BetaEnabled,
      isDatabasesV2Enabled: isDatabasesV2BetaEnabled || isDatabasesV2GAEnabled,
      isDatabasesV2GA: isDatabasesV2GAEnabled,

      isUserExistingBeta: isDatabasesV2BetaEnabled && isDatabasesV1Enabled,
      isUserNewBeta: isDatabasesV2BetaEnabled && !isDatabasesV1Enabled,
    };
  }

  const hasLegacyTypes: boolean = !!legacyTypes;
  const hasDefaultTypes: boolean = !!types && hasV2Flag;

  return {
    isDatabasesEnabled: hasLegacyTypes || hasDefaultTypes,

    isDatabasesV2Beta: hasDefaultTypes && hasV2BetaFlag,
    isDatabasesV2Enabled: hasDefaultTypes,
    isDatabasesV2GA: (hasLegacyTypes || hasDefaultTypes) && hasV2GAFlag,

    isUserExistingBeta: hasLegacyTypes && hasDefaultTypes && hasV2BetaFlag,
    isUserNewBeta: !hasLegacyTypes && hasDefaultTypes && hasV2BetaFlag,
  };
};

/**
 * Checks if a given date is outside the timeframe between the oldest backup and today.
 *
 * @param {DateTime} date - The date you want to check.
 * @param {DateTime | null} oldestBackup - The date of the oldest backup. If there are no backups (i.e., `null`), the function will return `true`.
 * @returns {boolean}
 *   - `true` if the date is before the oldest backup or after today.
 *   - `false` if the date is within the range between the oldest backup and today.
 */
export const isDateOutsideBackup = (
  date: DateTime,
  oldestBackup: DateTime | null | undefined
) => {
  if (!oldestBackup) {
    return true;
  }
  const today = DateTime.utc();
  return date < oldestBackup || date > today;
};

/**
 * Check if the time added to the selectedDate is outside the backup window.
 *
 * @param hour
 * @param selectedDate
 * @param oldestBackup
 * @returns true when the selectedDate + hour is before the oldest backup DateTime or later than DateTime.now()
 */
export const isTimeOutsideBackup = (
  time: number | undefined,
  selectedDate: DateTime,
  oldestBackup: DateTime
) => {
  if (time == null) {
    return false;
  }
  const selectedDateTime = toSelectedDateTime(selectedDate, time);
  return isDateOutsideBackup(selectedDateTime, oldestBackup);
};

/**
 * Convert the selectedDate and selectedTime into a date as a string value in ISO format.
 *
 * @param selectedDate
 * @param selectedTime
 * @returns date as a string value in ISO format.
 */
export const toISOString = (selectedDate: DateTime, selectedTime: number) => {
  const selectedDateTime = toSelectedDateTime(selectedDate, selectedTime);
  return selectedDateTime.toISO({ includeOffset: false });
};

export const toSelectedDateTime = (
  selectedDate: DateTime,
  time: number = 0
) => {
  const isoDate = selectedDate?.toISODate();
  const isoTime = DateTime.utc()
    .set({ hour: time, minute: 0 })
    ?.toISOTime({ includeOffset: false });
  return DateTime.fromISO(`${isoDate}T${isoTime}`, { zone: 'UTC' });
};

/**
 * Format the selectedDate and time as a modified (i.e. shortened) ISO format
 * If no date/time is provided it will default to DateTime.now()
 *
 * @param selectedDate
 * @param selectedTime
 * @returns date string in the format 'YYYY-MM-ddThh:mm:ss'
 */
export const toFormatedDate = (
  selectedDate?: DateTime | null,
  selectedTime?: number
) => {
  const today = DateTime.utc();
  const isoDate =
    selectedDate && selectedTime
      ? toISOString(selectedDate!, selectedTime)
      : toISOString(today, today.hour);

  return `${isoDate?.split('T')[0]} ${isoDate?.split('T')[1].slice(0, 5)}`;
};

/**
 * Convert the sourceId and optional selectedDate and selecteTime into the DatabaseFork payload.
 *
 * @param sourceId
 * @param selectedDate
 * @param selectedTime
 * @returns Databasefork object with at least the sourceId
 */
export const toDatabaseFork = (
  sourceId: number,
  selectedDate?: DateTime | null,
  selectedTime?: number
) => {
  const fork: DatabaseFork = {
    source: sourceId,
  };
  if (selectedDate && selectedTime) {
    fork.restore_time = toISOString(selectedDate!, selectedTime)!;
  }
  return fork;
};

export const DATABASE_ENGINE_MAP: Record<Engine, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
} as const;

export const getDatabasesDescription = (
  database: Pick<DatabaseInstance, 'engine' | 'version'>
) => {
  return `${DATABASE_ENGINE_MAP[database.engine]} v${database.version}`;
};

export const hasPendingUpdates = (pendingUpdates?: PendingUpdates[]) =>
  Boolean(pendingUpdates && pendingUpdates?.length > 0);

export const isDefaultDatabase = (
  database: Pick<DatabaseInstance, 'platform'>
) => database.platform === 'rdbms-default';

export const isLegacyDatabase = (
  database: Pick<DatabaseInstance, 'platform'>
) => !database.platform || database.platform === 'rdbms-legacy';

export const upgradableVersions = (
  engine: Engine,
  version: string,
  engines?: Pick<DatabaseEngine, 'engine' | 'version'>[]
) => engines?.filter((e) => e.engine === engine && e.version > version);

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
            category: category,
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
    | Record<string, Record<string, ConfigurationItem> | ConfigurationItem>
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
          value: value,
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
