import {
  createChildAccountPersonalAccessToken,
  getAccountInfo,
  getChildAccount,
  getChildAccounts,
  updateAccountInfo,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useGrants, useProfile } from 'src/queries/profile';

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

export const useChildAccounts = ({ filter, params }: RequestOptions) => {
  const { data: grants } = useGrants();

  return useQuery<ResourcePage<Account>, APIError[]>(
    [queryKey, 'childAccounts', 'paginated', params, filter],
    () => getChildAccounts({ filter, params }),
    {
      enabled: Boolean(grants?.global?.child_account_access),
      keepPreviousData: true,
    }
  );
};

export const useChildAccount = ({ euuid }: ChildAccountPayload) => {
  const { data: grants } = useGrants();
  return useQuery<Account, APIError[]>(
    [queryKey, 'childAccounts', 'childAccount', euuid],
    () => getChildAccount({ euuid }),
    { enabled: Boolean(grants?.global?.child_account_access) }
  );
};

export const useCreateChildAccountPersonalAccessTokenMutation = ({
  euuid,
  headers,
}: ChildAccountPayload) => {
  const { data: grants } = useGrants();
  const hasExplictAuthToken = headers?.hasAuthorization();

  return useQuery<Token, APIError[], ChildAccountPayload>(
    [queryKey, 'childAccounts', 'childAccount', euuid, 'personal-access-token'],
    () => createChildAccountPersonalAccessToken({ euuid, headers }),
    {
      // If the header has an authorization defined, we're going to assume it's the parent account
      // This is to avoid having to add more logic to useGrants and useProfile.
      // The API will return an error if the parent account does not have the child_account_access grant.
      enabled:
        Boolean(grants?.global?.child_account_access) || hasExplictAuthToken,
    }
  );
};
