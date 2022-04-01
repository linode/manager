import { User, getUsers } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';
import { map as mapPromise } from 'bluebird';
import { getGravatarUrl } from 'src/utilities/gravatar';

export const queryKey = 'account-users';

export const useAccountUsers = (params: any, withGravatar: boolean = false) =>
  useQuery<ResourcePage<User>, APIError[]>(
    [queryKey, params.page, params.page_size],
    withGravatar ? () => getUsersWithGravatar(params) : () => getUsers(params),
    queryPresets.oneTimeFetch
  );

const getUsersWithGravatar = (params?: any, filters?: any) =>
  getUsers(params, filters).then(({ data, page, pages, results }) =>
    mapPromise(data, (user) =>
      getGravatarUrl(user.email).then((gravatarUrl: string) => ({
        ...user,
        gravatarUrl,
      }))
    ).then((updatedUsers) => ({ page, pages, results, data: updatedUsers }))
  );
