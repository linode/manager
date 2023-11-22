import {
  Account,
  getAccountInfo,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile';

import { queryPresets } from './base';

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
