import {
  AccountSettings,
  getAccountSettings,
  updateAccountSettings,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';

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
    {
      onSuccess: (updatedEntity) => {
        queryClient.setQueryData<AccountSettings>(queryKey, (oldData) => ({
          ...oldData,
          ...updatedEntity,
        }));
      },
    }
  );
};

export const isManaged = Boolean(
  queryClient.getQueryData<AccountSettings>('account-settings')?.managed
);

/**
 * updateAccountSettingsData is a function that we can use to directly update
 * the React Query store for account settings.
 * @param data {Partial<AccountSettings>} account settings to update
 */
export const updateAccountSettingsData = (
  data: Partial<AccountSettings>
): void => {
  queryClient.setQueryData(queryKey, (oldData: AccountSettings) => ({
    ...oldData,
    ...data,
  }));
};
