import { User, getUser, getUsers } from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import { useProfile } from 'src/queries/profile';

import { queryKey } from './account';

export const useAccountUsers = (params?: Params, filters?: Filter) => {
  const { data: profile } = useProfile();

  return useQuery<ResourcePage<User>, APIError[]>(
    [queryKey, 'users', 'paginated', params, filters],
    () => getUsers(params, filters),
    {
      enabled: !profile?.restricted,
    }
  );
};

export const useAccountUser = (username: string) => {
  return useQuery<User, APIError[]>(
    [queryKey, 'users', 'user', username],
    () => getUser(username),
    // Enable the query if the user is not on the blocklist
    { enabled: !getIsBlocklistedUser(username) }
  );
};

/**
 * Returns true if a user is "blocklisted". We do this because some accounts
 * such as service accounts will 404 when we hit the account endpoint.
 * @param username a user's username
 * @returns true if account is blocklisted (should *not* be fetched)
 */
function getIsBlocklistedUser(username: string) {
  if (!username) {
    // "Block" empty, null, or undefined usernames so a query does not run
    return true;
  }
  if (username.startsWith('lke-service-account-')) {
    return true;
  }
  if (username === 'Linode') {
    return true;
  }
  return false;
}
