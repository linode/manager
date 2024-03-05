import {
  createChildAccountPersonalAccessToken,
  getAccountInfo,
  getAccountLogins,
  getAccountSettings,
  getChildAccounts,
  getGrants,
  getOAuthClients,
  getUser,
  getUsers,
  updateAccountInfo,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useGrants, useProfile } from 'src/queries/profile';

import { queryPresets } from '../base';
import { getAllNotifications } from './notifications';

import type {
  APIError,
  Account,
  ChildAccountPayload,
  Filter,
  Params,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const accountQueries = createQueryKeys('account', {
  account: {
    queryFn: getAccountInfo,
    queryKey: null,
  },
  childAccounts: (options: RequestOptions) => ({
    queryFn: ({ pageParam }) =>
      getChildAccounts({
        filter: options.filter,
        headers: options.headers,
        params: {
          page: pageParam,
          page_size: 25,
        },
      }),
    queryKey: [options],
  }),
  logins: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAccountLogins(params, filter),
    queryKey: [params, filter],
  }),
  notifications: {
    queryFn: () => getAllNotifications(),
    queryKey: null,
  },
  oauthClients: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getOAuthClients(params, filter),
    queryKey: [params, filter],
  }),
  settings: {
    queryFn: getAccountSettings,
    queryKey: null,
  },
  users: {
    contextQueries: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getUsers(params, filter),
        queryKey: [params, filter],
      }),
      user: (username: string) => ({
        contextQueries: {
          grants: {
            queryFn: () => getGrants(username),
            queryKey: null,
          },
        },
        queryFn: () => getUser(username),
        queryKey: [username],
      }),
    },
    queryKey: null,
  },
});

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, APIError[], Partial<Account>>(updateAccountInfo, {
    onSuccess(account) {
      queryClient.setQueryData(accountQueries.account.queryKey, account);
    },
  });
};

export const useChildAccountsInfiniteQuery = (options: RequestOptions) => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(options.headers?.Authorization);
  const enabled =
    (Boolean(profile?.user_type === 'parent') && !profile?.restricted) ||
    Boolean(grants?.global?.child_account_access) ||
    hasExplicitAuthToken;

  return useInfiniteQuery<ResourcePage<Account>, APIError[]>({
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    keepPreviousData: true,
    ...accountQueries.childAccounts(options),
  });
};

export const useCreateChildAccountPersonalAccessTokenMutation = ({
  euuid,
  headers,
}: ChildAccountPayload) =>
  useMutation<Token, APIError[], ChildAccountPayload>(() =>
    createChildAccountPersonalAccessToken({ euuid, headers })
  );
