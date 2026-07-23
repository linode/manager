import { useAccount, useDatabaseTypesQuery } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { parse as parseIP } from 'ipaddr.js';
import { DateTime } from 'luxon';

import type { ExtendedIP } from '@akamai/compute-ui-core/api';
import type {
  Database,
  DatabaseEngine,
  DatabaseFork,
  DatabaseInstance,
  DatabaseStatus,
  Engine,
  PendingUpdates,
} from '@linode/api-v4';

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
export const useIsDatabasesEnabled = () => {
  const { data: account } = useAccount();
  // If we don't have permission to GET /v4/account,
  // we need to try fetching Database engines to know if the user has databases enabled.
  const checkRestrictedUser = !account;

  const { data: types } = useDatabaseTypesQuery(
    { platform: 'rdbms-default' },
    checkRestrictedUser
  );

  if (account) {
    return isFeatureEnabledV2(
      'Managed Databases',
      true,
      account?.capabilities ?? []
    );
  }

  return !!types;
};

/**
 * Checks if a given date is outside the timeframe between the oldest backup and today.
 *
 * @param {DateTime} date - The date you want to check.
 * @param {DateTime | null} oldestBackup - The date of the oldest backup. If there are no backups (i.e., `null`), the function will return `true`.
 * @returns {boolean}
 *   - `true` if the date/time is before the oldest backup or after today.
 *   - `false` if the date/time is within the range between the oldest backup and today.
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
 * @param selectedTime
 * @param selectedDate
 * @param oldestBackup
 * @returns true when the selectedDate and selectedTime is before the oldest backup DateTime or later than the current date/time using DateTime.utc()
 */
export const isTimeOutsideBackup = (
  selectedTime: DateTime | null,
  selectedDate: DateTime,
  oldestBackup: DateTime
) => {
  if (selectedTime === null) {
    return false;
  }
  const selectedDateTime = toSelectedDateTime(selectedDate, selectedTime);
  return isDateOutsideBackup(selectedDateTime, oldestBackup);
};

/**
 * Convert the selectedDate and selectedTime into a date as a string value in ISO format.
 *
 * @param selectedDate
 * @param selectedTime
 * @returns date as a string value in ISO format.
 */
export const toISOString = (selectedDate: DateTime, selectedTime: DateTime) => {
  const selectedDateTime = toSelectedDateTime(selectedDate, selectedTime);
  return selectedDateTime.toISO({ includeOffset: false });
};

export const toSelectedDateTime = (
  selectedDate: DateTime,
  selectedTime: DateTime | null
) => {
  const isoDate = selectedDate?.toISODate();
  const isoTime = DateTime.utc()
    .set({
      hour: selectedTime?.hour,
      minute: selectedTime?.minute,
      second: selectedTime?.second,
    })
    ?.toISOTime({ includeOffset: false });
  return DateTime.fromISO(`${isoDate}T${isoTime}`, { zone: 'UTC' });
};

/**
 * Format the selectedDate and time as a modified (i.e. shortened) ISO format
 * If no date/time is provided it will default to the current date/time using DateTime.utc()
 *
 * @param selectedDate
 * @param selectedTime
 * @returns date string in the format 'YYYY-MM-ddThh:mm:ss'
 */
export const toFormattedDate = (
  selectedDate?: DateTime | null,
  selectedTime?: DateTime | null
) => {
  const today = DateTime.utc();
  const isoDate =
    selectedDate && selectedTime
      ? toISOString(selectedDate!, selectedTime)
      : toISOString(today, today);
  return `${isoDate?.split('T')[0]} ${isoDate?.split('T')[1].slice(0, 8)}`;
};

/**
 * Convert the sourceId and optional selectedDate and selectedTime into the DatabaseFork payload.
 *
 * @param sourceId
 * @param selectedDate
 * @param selectedTime
 * @returns Databasefork object with at least the sourceId
 */
export const toDatabaseFork = (
  sourceId: number,
  selectedDate?: DateTime | null,
  selectedTime?: DateTime | null
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
  valkey: 'Valkey',
} as const;

export const getDatabasesDescription = (
  database: Pick<DatabaseInstance, 'engine' | 'version'>
) => {
  return `${DATABASE_ENGINE_MAP[database.engine]} v${database.version}`;
};

export const hasPendingUpdates = (pendingUpdates?: PendingUpdates[]) =>
  Boolean(pendingUpdates && pendingUpdates?.length > 0);

export const upgradableVersions = (
  engine: Engine,
  version: string,
  engines?: Pick<DatabaseEngine, 'engine' | 'version'>[]
) => engines?.filter((e) => e.engine === engine && e.version > version);

export const getReadOnlyHost = (database: Database | undefined) =>
  database?.hosts?.standby ?? '';

/** This function converts a private hostname string to public by replacing 'private-' at the beginning of the private hostname string with 'public-'.
 * This is used to format the hostname string returned from the backend when a VPC is configured for a database cluster
 * and the backend provides the hostname with 'private-' prepended.
 */
export const convertPrivateToPublicHostname = (host: string) => {
  const privateStrIndex = host.indexOf('-');
  const baseHostName = host.slice(privateStrIndex + 1);
  return `public-${baseHostName}`;
};

export const getIsLinkInactive = (status: DatabaseStatus) =>
  ['migrated', 'resuming', 'suspended', 'suspending'].includes(status);

export const enforceIPMasks = (ips: ExtendedIP[]): ExtendedIP[] => {
  // Check if a mask was provided and if not, add the appropriate mask for IPv4 or IPv6 addresses, respectively.
  return ips.map((extendedIP) => {
    const ipAddress = extendedIP.address;

    const [base, mask] = ipAddress.split('/');
    if (mask) {
      // The user provided a mask already
      return extendedIP;
    }

    try {
      const parsed = parseIP(base);
      const type = parsed.kind();

      const appendedMask = type === 'ipv4' ? '/32' : '/128';
      const ipWithMask = base + appendedMask;

      return { ...extendedIP, address: ipWithMask };
    } catch (err) {
      return extendedIP;
    }
  });
};
