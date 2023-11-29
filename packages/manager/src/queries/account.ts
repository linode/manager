import {
  Account,
  CreateChildAccountPersonalAccessTokenPayload,
  createChildAccountPersonalAccessToken,
  getAccountInfo,
  getChildAccount,
  getChildAccounts,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { Token } from '@linode/api-v4/lib/profile/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useGrants, useProfile } from 'src/queries/profile';

import { queryPresets } from './base';

import type { APIError, Filter, Params } from '@linode/api-v4';

export const queryKey = 'account';

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>(queryKey, getAccountInfo, {
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, APIError[], Partial<Account>>(updateAccountInfo, {
    onSuccess(account) {
      queryClient.setQueryData(queryKey, account);
    },
  });
};

export const useChildAccounts = (params?: Params, filters?: Filter) => {
  const { data: grants } = useGrants();

  return useQuery<Account, APIError[]>(
    [queryKey, 'childAccounts', 'paginated', params, filters],
    () => getChildAccounts(params, filters),
    {
      enabled: Boolean(grants?.global?.child_account_access),
      keepPreviousData: true,
    }
  );
};

export const useChildAccount = (euuid: string) => {
  const { data: grants } = useGrants();
  return useQuery<Account, APIError[]>(
    [queryKey, 'childAccounts', 'childAccount', euuid],
    () => getChildAccount(euuid),
    { enabled: Boolean(grants?.global?.child_account_access) }
  );
};

export const useCreateChildAccountPersonalAccessTokenMutation = (
  euuid: string,
  parentToken?: string
) => {
  const { data: grants } = useGrants();

  return useQuery<
    Token,
    APIError[],
    CreateChildAccountPersonalAccessTokenPayload
  >(
    [queryKey, 'childAccounts', 'childAccount', euuid, 'personal-access-token'],
    () => createChildAccountPersonalAccessToken(euuid, parentToken),
    {
      // If the parentToken param is provided, we're going to assume it's the parent account
      // This is to avoid having to add more logic to useGrants and useProfile.
      // The API will return an error if the parentToken does not have the child_account_access grant.
      enabled:
        Boolean(grants?.global?.child_account_access) || Boolean(parentToken),
    }
  );
};
