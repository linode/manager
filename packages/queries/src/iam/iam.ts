import { updateUserRoles } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useProfile } from '../profile';
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

export const useUserAccountPermissions = (enabled = true) => {
  const { data: profile } = useProfile();
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries.user(profile!.username)._ctx.accountPermissions,
    enabled: profile?.restricted && enabled,
  });
};

export const useUserEntityPermissions = (
  entityType: AccessType,
  entityId: number,
) => {
  const { data: profile } = useProfile();
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries
      .user(profile!.username)
      ._ctx.entityPermissions(entityType, entityId),
    enabled: profile?.restricted && Boolean(entityType && entityId),
  });
};
