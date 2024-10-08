import { DatabaseFork } from '@linode/api-v4';
import { DateTime } from 'luxon';

import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

/**
 * A hook to determine if Databases should be visible to the user.
 *
 * For unrestricted users, databases will show when
 * The user has the `Managed Databases` account capability.
 *
 * For users who don't have permission to load /v4/account
 * (who are restricted users without account read access),
 * we must check if they can load Database Engines as a workaround.
 * If these users can successfully fetch database engines, we will
 * show databases.
 */
export const useIsDatabasesEnabled = () => {
  const { data: account } = useAccount();

  // If we don't have permission to GET /v4/account,
  // we need to try fetching Database engines to know if the user has databases enabled.
  const checkRestrictedUser = !account;

  const { data: engines } = useDatabaseEnginesQuery(checkRestrictedUser);
  const flags = useFlags();
  const isBeta = !!flags.dbaasV2?.beta;

  if (account) {
    const isDatabasesV1Enabled = isFeatureEnabledV2(
      'Managed Databases',
      true,
      account?.capabilities ?? []
    );

    const isDatabasesV2Enabled = isFeatureEnabledV2(
      'Managed Databases Beta',
      !!flags.dbaasV2?.enabled,
      account?.capabilities ?? []
    );

    const isV2ExistingBetaUser =
      isBeta && isDatabasesV1Enabled && isDatabasesV2Enabled;

    const isV2NewBetaUser =
      isBeta && !isDatabasesV1Enabled && isDatabasesV2Enabled;

    const isV2GAUser =
      !isBeta &&
      isFeatureEnabledV2(
        'Managed Databases',
        !!flags.dbaasV2?.enabled,
        account?.capabilities ?? []
      );

    return {
      isDatabasesEnabled: isDatabasesV1Enabled || isDatabasesV2Enabled,
      isDatabasesV1Enabled,
      isDatabasesV2Beta: isDatabasesV2Enabled && flags.dbaasV2?.beta,
      isDatabasesV2Enabled,
      isV2ExistingBetaUser,
      isV2GAUser,
      isV2NewBetaUser,
    };
  }

  const userCouldLoadDatabaseEngines = engines !== undefined;

  return {
    isDatabasesEnabled: userCouldLoadDatabaseEngines,
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
  const today = DateTime.now();
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
  const isoTime = DateTime.now()
    .set({ hour: time, minute: 0 })
    ?.toISOTime({ includeOffset: false });
  const selectedDateTime = DateTime.fromISO(`${isoDate}T${isoTime}`);
  return selectedDateTime;
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
  const today = DateTime.now();
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
