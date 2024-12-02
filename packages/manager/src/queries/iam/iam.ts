import {
  APIError,
  IamUserPermissions,
  IamAccountPermissions,
} from '@linode/api-v4';
import { iamQueries } from './queries';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from 'src/queries/profile/profile';
import { queryPresets } from '../base';

export const useAccountUserPermissions = (username: string) => {
  return useQuery<IamUserPermissions, APIError[]>(
    iamQueries.user(username)._ctx.permissions
  );
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
