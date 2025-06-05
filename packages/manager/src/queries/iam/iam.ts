import { updateUserRoles } from '@linode/api-v4';
import { queryPresets } from '@linode/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { iamQueries } from './queries';

import type { APIError, IamAccountRoles, IamUserRoles } from '@linode/api-v4';

export const useUserRoles = (username?: string) => {
  return useQuery<IamUserRoles, APIError[]>({
    ...iamQueries.user(username ?? '')._ctx.permissions,
    refetchOnMount: 'always',
    enabled: Boolean(username),
  });
};

export const useAccountRoles = (enabled = true) => {
  return useQuery<IamAccountRoles, APIError[]>({
    ...iamQueries.permissions,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled,
  });
};

export const useUserRolesMutation = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation<IamUserRoles, APIError[], IamUserRoles>({
    mutationFn: (data) => updateUserRoles(username, data),
    onSuccess: (role) => {
      queryClient.setQueryData<IamUserRoles>(
        iamQueries.user(username)._ctx.permissions.queryKey,
        role
      );
    },
  });
};
