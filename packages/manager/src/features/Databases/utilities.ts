import { DateTime } from 'luxon';

import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';

import { databaseEngineMap } from './DatabaseLanding/DatabaseRow';

import type { DatabaseInstance } from '@linode/api-v4';

/**
 * A hook to determine if Databases should be visible to the user.
 *
 * Because DBaaS is end of sale, we treat it differently than other products.
 * It should only be visible to customers with the account capability.
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

  if (account) {
    const isDatabasesV1Enabled = account.capabilities.includes(
      'Managed Databases'
    );

    const isDatabasesV2Enabled =
      account.capabilities.includes('Managed Databases Beta') &&
      flags.dbaasV2?.enabled;

    const isV2ExistingBetaUser =
      account.capabilities.includes('Managed Databases') &&
      account.capabilities.includes('Managed Databases Beta') &&
      flags.dbaasV2?.enabled &&
      flags.dbaasV2?.beta;

    const isV2NewBetaUser =
      account.capabilities.includes('Managed Databases Beta') &&
      !account.capabilities.includes('Managed Databases') &&
      flags.dbaasV2?.enabled &&
      flags.dbaasV2?.beta;

    const isV2GAUser =
      account.capabilities.includes('Managed Databases') &&
      flags.dbaasV2?.enabled &&
      !flags.dbaasV2?.beta;

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
export const isOutsideBackupTimeframe = (
  date: DateTime,
  oldestBackup: DateTime | null
) => {
  if (!oldestBackup) {
    return true;
  }

  const today = DateTime.now().startOf('day');
  const backupStart = oldestBackup.startOf('day');
  const dateStart = date.startOf('day');

  return dateStart < backupStart || dateStart > today;
};

export const getDatabasesDescription = (database: DatabaseInstance) => {
  const dbEngineLabel = `${databaseEngineMap[database.engine]} v${
    database.version
  }`;
  const clusterSize = database.cluster_size + ' GB';
  const description = [dbEngineLabel, clusterSize];
  return description.join(', ');
};
