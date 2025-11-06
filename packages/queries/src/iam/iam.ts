import { updateUserRoles } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useProfile } from '../profile';
import { iamQueries } from './keys';

import type {
  AccessType,
  APIError,
  AvailableEntityFromPermission,
  GetAvailableEntitiesFromPermissionParams,
  IamAccountRoles,
  IamUserRoles,
  PermissionType,
} from '@linode/api-v4';

export const useUserRoles = (username?: string, enabled: boolean = true) => {
  return useQuery<IamUserRoles, APIError[]>({
    ...iamQueries.user(username ?? '')._ctx.roles,
    refetchOnMount: 'always',
    enabled: Boolean(username) && enabled,
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

export const useUserRolesMutation = (username: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<IamUserRoles, APIError[], IamUserRoles>({
    mutationFn: (data) => {
      if (!username) {
        throw new Error('Username is required');
      }
      return updateUserRoles(username, data);
    },
    onSuccess: (role) => {
      if (username) {
        queryClient.setQueryData<IamUserRoles>(
          iamQueries.user(username)._ctx.roles.queryKey,
          role,
        );
      }
    },
  });
};

export const useUserAccountPermissions = (enabled = true) => {
  const { data: profile } = useProfile();
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries.user(profile?.username || '')._ctx.accountPermissions,
    enabled: Boolean(profile?.username) && profile?.restricted && enabled,
  });
};

export const useUserEntityPermissions = (
  entityType: AccessType,
  entityId: number | string,
  enabled = true,
) => {
  const { data: profile } = useProfile();
  return useQuery<PermissionType[], APIError[]>({
    ...iamQueries
      .user(profile?.username || '')
      ._ctx.entityPermissions(entityType, entityId),
    enabled:
      Boolean(profile?.username) &&
      profile?.restricted &&
      Boolean(entityType && entityId) &&
      enabled,
  });
};

export const useAvailableEntitiesFromPermission = ({
  username,
  entityType,
  permission,
}: GetAvailableEntitiesFromPermissionParams) => {
  const { data: profile } = useProfile();
  return useQuery<AvailableEntityFromPermission[], APIError[]>({
    ...iamQueries
      .user(username)
      ._ctx.availableEntitiesFromPermission(entityType, permission),
    enabled:
      Boolean(username && entityType && permission) && profile?.restricted,
  });
};
