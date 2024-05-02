import { useAccount } from 'src/queries/account/account';
import { useDatabaseEnginesQuery } from 'src/queries/databases';

/**
 * A hook to determine if Databases should be visible to the user.
 *
 * For unrestricted users, databases will show when
 * The user has the `Managed Databases` account capability.
 *
 * For users who don't have permission to load /v4/account
 * (which is restricted users with no billing access),
 * we must check if they can load Database Engines as a workaround.
 * If these users can successfully fetch database engines, we will
 * show databases.
 */
export const useIsDatabasesEnabled = () => {
  const { data: account } = useAccount();

  // If the flag is off AND we don't have permission to GET /v4/account,
  // we need to try fetching Database engines to know if the user has databases enabled.
  const checkRestrictedUser = !account;

  const { data: engines } = useDatabaseEnginesQuery(checkRestrictedUser);

  if (account) {
    return {
      isDatabasesEnabled: account.capabilities.includes('Managed Databases'),
    };
  }

  const userCouldLoadDatabaseEngines = engines !== undefined;

  return {
    isDatabasesEnabled: userCouldLoadDatabaseEngines,
  };
};
