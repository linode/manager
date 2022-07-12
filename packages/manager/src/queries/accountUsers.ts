import { APIError, ResourcePage, User, getUsers } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { queryPresets } from './base';
import { map as mapPromise } from 'bluebird';
import { default as memoize } from 'memoizee';
import { useProfile } from 'src/queries/profile';
import { getGravatarUrl } from 'src/utilities/gravatar';

export const queryKey = 'account-users';

export const useAccountUsers = (params: any, withGravatar: boolean = false) => {
  const { data: profile } = useProfile();

  return useQuery<ResourcePage<User>, APIError[]>(
    [queryKey, params.page, params.page_size],
    withGravatar ? () => getUsersWithGravatar(params) : () => getUsers(params),
    {
      ...queryPresets.oneTimeFetch,
      enabled: !profile?.restricted,
    }
  );
};

const memoizedGetGravatarURL = memoize(getGravatarUrl);

const getUsersWithGravatar = (params?: any, filters?: any) =>
  getUsers(params, filters).then(({ data, page, pages, results }) =>
    mapPromise(data, (user) =>
      memoizedGetGravatarURL(user.email).then((gravatarUrl: string) => ({
        ...user,
        gravatarUrl,
      }))
    ).then((updatedUsers) => ({ page, pages, results, data: updatedUsers }))
  );
