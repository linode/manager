import {
  createChildAccountPersonalAccessToken,
  getAccountInfo,
  getChildAccount,
  getChildAccounts,
  updateAccountInfo,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useGrants, useProfile } from 'src/queries/profile';

import { useAccountUser } from './accountUsers';
import { queryPresets } from './base';

import type {
  APIError,
  Account,
  ChildAccountPayload,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const queryKey = 'account';

export const useAccount = ({ headers }: RequestOptions = {}) => {
  const { data: profile } = useProfile();
  const hasExplicitAuthToken = Boolean(headers?.Authorization);

  return useQuery<Account, APIError[]>(
    queryKey,
    () => getAccountInfo({ headers }),
    {
      ...queryPresets.oneTimeFetch,
      ...queryPresets.noRetry,
      enabled: !profile?.restricted || hasExplicitAuthToken,
    }
  );
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, APIError[], Partial<Account>>(updateAccountInfo, {
    onSuccess(account) {
      queryClient.setQueryData(queryKey, account);
    },
  });
};

/**
 * For useChildAccounts and useChildAccount:
 * Assuming authorization in the header implies parent account.
 * API error expected if parent account lacks child_account_access grant.
 */
export const useChildAccounts = ({
  filter,
  headers,
  params,
}: RequestOptions) => {
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(headers?.Authorization);

  return useQuery<ResourcePage<Account>, APIError[]>(
    [queryKey, 'childAccounts', 'paginated', params, filter],
    () => getChildAccounts({ filter, headers, params }),
    {
      enabled:
        (Boolean(user?.user_type === 'parent') && !profile?.restricted) ||
        Boolean(grants?.global?.child_account_access) ||
        hasExplicitAuthToken,
      keepPreviousData: true,
    }
  );
};

export const useChildAccount = ({ euuid, headers }: ChildAccountPayload) => {
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(headers?.Authorization);

  return useQuery<Account, APIError[]>(
    [queryKey, 'childAccounts', 'childAccount', euuid],
    () => getChildAccount({ euuid }),
    {
      enabled:
        (Boolean(user?.user_type === 'parent') && !profile?.restricted) ||
        Boolean(grants?.global?.child_account_access) ||
        hasExplicitAuthToken,
    }
  );
};

export const useCreateChildAccountPersonalAccessTokenMutation = ({
  euuid,
  headers,
}: ChildAccountPayload) =>
  useMutation<Token, APIError[], ChildAccountPayload>(() =>
    createChildAccountPersonalAccessToken({ euuid, headers })
  );
