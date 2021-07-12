import {
  AccountSettings,
  getAccountSettings,
  updateAccountSettings,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { mutationHandlers, queryPresets } from './base';

const queryKey = 'account-settings';

export const useAccountSettings = () =>
  useQuery<AccountSettings, APIError[]>(
    queryKey,
    getAccountSettings,
    queryPresets.oneTimeFetch
  );

export const useMutateAccountSettings = () => {
  return useMutation<AccountSettings, APIError[], Partial<AccountSettings>>(
    (data) => {
      return updateAccountSettings(data);
    },
    mutationHandlers(queryKey)
  );
};
