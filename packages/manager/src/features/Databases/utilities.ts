import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { DateTime } from 'luxon';

import { useFlags } from 'src/hooks/useFlags';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';

import type {
  DatabaseEngine,
  DatabaseFork,
  DatabaseInstance,
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
