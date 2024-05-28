import {
  createChildAccountPersonalAccessToken,
  updateAccountInfo,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useGrants, useProfile } from 'src/queries/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type {
  Account,
  ChildAccountPayload,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, FormattedAPIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, FormattedAPIError[], Partial<Account>>(
    updateAccountInfo,
    {
      onSuccess(account) {
        queryClient.setQueryData(accountQueries.account.queryKey, account);
      },
    }
  );
};

export const useChildAccountsInfiniteQuery = (options: RequestOptions) => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(options.headers?.Authorization);
  const enabled =
    (Boolean(profile?.user_type === 'parent') && !profile?.restricted) ||
    Boolean(grants?.global?.child_account_access) ||
    hasExplicitAuthToken;

  return useInfiniteQuery<ResourcePage<Account>, FormattedAPIError[]>({
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

export const useCreateChildAccountPersonalAccessTokenMutation = () =>
  useMutation<Token, FormattedAPIError[], ChildAccountPayload>(
    ({ euuid, headers }: ChildAccountPayload) =>
      createChildAccountPersonalAccessToken({ euuid, headers })
  );
