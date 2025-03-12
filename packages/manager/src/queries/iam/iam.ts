import { queryPresets, useProfile } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { iamQueries } from './queries';

import type {
  APIError,
  IamAccountPermissions,
  IamUserPermissions,
} from '@linode/api-v4';

export const useAccountUserPermissions = (username?: string) => {
  return useQuery<IamUserPermissions, APIError[]>({
    ...iamQueries.user(username ?? '')._ctx.permissions,
    enabled: Boolean(username),
  });
};

export const useAccountPermissions = () => {
  const { data: profile } = useProfile();

  return useQuery<IamAccountPermissions, APIError[]>({
    ...iamQueries.permissions,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
