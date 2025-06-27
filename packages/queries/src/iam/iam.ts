import { updateUserRoles } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { iamQueries } from './keys';

import type {
  AccessType,
  APIError,
  IamAccountRoles,
  IamUserRoles,
  PermissionType,
} from '@linode/api-v4';

export const useUserRoles = (username?: string) => {
  return useQuery<IamUserRoles, APIError[]>({
    ...iamQueries.user(username ?? '')._ctx.roles,
    refetchOnMount: 'always',
    enabled: Boolean(username),
  });
};

export const useAccountRoles = (enabled = true) => {
  return useQuery<IamAccountRoles, APIError[]>({
    ...iamQueries.accountRoles,
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
        iamQueries.user(username)._ctx.roles.queryKey,
        role,
      );
    },
  });
};

export const useUserAccountPermissions = (username?: string) => {
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries.user(username ?? '')._ctx.accountPermissions,
    enabled: Boolean(username),
  });
};

export const useUserEntityPermissions = (
  entityType: AccessType,
  entityId: number,
  username?: string,
) => {
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries
      .user(username ?? '')
      ._ctx.entityPermissions(entityType, entityId),
    enabled: Boolean(username),
  });
};
