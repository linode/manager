import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';

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
      account.capabilities.includes('Managed Databases V2') &&
      flags.dbaasV2?.enabled;

    return {
      isDatabasesEnabled: isDatabasesV1Enabled || isDatabasesV2Enabled,
      isDatabasesV1Enabled,
      isDatabasesV2Enabled,
    };
  }

  const userCouldLoadDatabaseEngines = engines !== undefined;

  return {
    isDatabasesEnabled: userCouldLoadDatabaseEngines,
  };
};
