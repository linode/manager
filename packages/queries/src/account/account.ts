import {
  createChildAccountPersonalAccessToken,
  updateAccountInfo,
} from '@linode/api-v4';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useGrants, useProfile } from '../profile';
import { accountQueries } from './queries';

import type {
  Account,
  APIError,
  ChildAccountPayload,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const useAccount = (enabled: boolean = true) => {
  return useQuery<Account, APIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled,
  });
};

export const useMutateAccount = () =>
  useMutation<Account, APIError[], Partial<Account>>({
    mutationFn: updateAccountInfo,
  });

export const useChildAccountsInfiniteQuery = (
  options: RequestOptions,
  featureFlag = true,
) => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(options.headers?.Authorization);

  const enabled = featureFlag
    ? (Boolean(profile?.user_type === 'parent') && !profile?.restricted) ||
      Boolean(grants?.global?.child_account_access) ||
      hasExplicitAuthToken
    : false;

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
