import {
  deleteUser,
  getGrants,
  getUser,
  getUsers,
} from '@linode/api-v4/lib/account';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useProfile } from 'src/queries/profile';

import { queryKey } from './account';

import type {
  APIError,
  Filter,
  Grants,
  Params,
  ResourcePage,
  User,
} from '@linode/api-v4';

export const useAccountUsers = ({
  enabled = true,
  filters,
  params,
}: {
  enabled?: boolean;
  filters?: Filter;
  params?: Params;
}) => {
  const { data: profile } = useProfile();

  return useQuery<ResourcePage<User>, APIError[]>(
    [queryKey, 'users', 'paginated', params, filters],
    () => getUsers(params, filters),
    {
      enabled: enabled && !profile?.restricted,
      keepPreviousData: true,
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

export const useAccountUserGrants = (username: string) => {
  return useQuery<Grants, APIError[]>(
    [queryKey, 'users', 'grants', username],
    () => getGrants(username)
  );
};

export const useAccountUserDeleteMutation = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteUser(username), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'users', 'paginated']);
      queryClient.removeQueries([queryKey, 'users', 'user', username]);
    },
  });
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
