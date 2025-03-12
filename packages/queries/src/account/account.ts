import {
  createChildAccountPersonalAccessToken,
  updateAccountInfo,
} from '@linode/api-v4';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useGrants, useProfile } from '../profile';
import { accountQueries } from './queries';

import type {
  APIError,
  Account,
  ChildAccountPayload,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () =>
  useMutation<Account, APIError[], Partial<Account>>({
    mutationFn: updateAccountInfo,
  });

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
    initialPageParam: 1,
    ...accountQueries.childAccounts(options),
  });
};

export const useCreateChildAccountPersonalAccessTokenMutation = () =>
  useMutation<Token, APIError[], ChildAccountPayload>({
    mutationFn: ({ euuid, headers }: ChildAccountPayload) =>
      createChildAccountPersonalAccessToken({ euuid, headers }),
  });
