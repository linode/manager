import { createUser, deleteUser, updateUser } from '@linode/api-v4';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { profileQueries, useProfile } from 'src/queries/profile/profile';

import { accountQueries } from './queries';

import type {
  APIError,
  Filter,
  Grants,
  Params,
  Profile,
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

  return useQuery<ResourcePage<User>, APIError[]>({
    ...accountQueries.users._ctx.paginated(params, filters),
    enabled: enabled && !profile?.restricted,
    placeholderData: keepPreviousData,
  });
};

export const useAccountUser = (username: string) => {
  return useQuery<User, APIError[]>({
    ...accountQueries.users._ctx.user(username),
    // Enable the query if the user is not on the blocklist
    enabled: !getIsBlocklistedUser(username),
  });
};

export const useAccountUserGrants = (username: string) => {
  return useQuery<Grants, APIError[]>(
    accountQueries.users._ctx.user(username)._ctx.grants
  );
};

export const useUpdateUserMutation = (username: string) => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation<User, APIError[], Partial<User>>({
    mutationFn: (data) => updateUser(username, data),
    onSuccess(user) {
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
      queryClient.setQueryData(
        accountQueries.users._ctx.user(user.username).queryKey,
        user
      );

      // If the currently logged in user updates their user, we need to update the profile
      // query to reflect the latest data.
      if (username === profile?.username) {
        queryClient.setQueryData<Profile>(
          profileQueries.profile().queryKey,
          (oldProfile) => {
            if (!oldProfile) {
              return;
            }

            return { ...oldProfile, ...user };
          }
        );
      }
    },
  });
};

export const useAccountUserDeleteMutation = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteUser(username),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
      queryClient.removeQueries({
        queryKey: accountQueries.users._ctx.user(username).queryKey,
      });
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

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<User, APIError[], Partial<User>>({
    mutationFn: (data) => createUser(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });

      queryClient.setQueryData(
        accountQueries.users._ctx.user(user.username).queryKey,
        user
      );
    },
  });
};
