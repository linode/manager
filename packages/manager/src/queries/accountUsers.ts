import { getUser, getUsers, User } from '@linode/api-v4/lib/account';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { useProfile } from 'src/queries/profile';

export const queryKey = 'account-users';

export const useAccountUsers = (params?: any) => {
  const { data: profile } = useProfile();

  return useQuery<ResourcePage<User>, APIError[]>(
    [queryKey, params.page, params.page_size],
    () => getUsers(params),
    {
      enabled: !profile?.restricted,
    }
  );
};

export const useAccountUser = (username: string) => {
  return useQuery<User, APIError[]>([queryKey, username], () => {
    if (getIsBacklistedUser(username)) {
      throw new Error(JSON.stringify([{ reason: 'User not found' }]));
    }
    return getUser(username);
  });
};

function getIsBacklistedUser(username: string) {
  if (username.startsWith('lke-service-account-')) {
    return true;
  }
  return false;
}
