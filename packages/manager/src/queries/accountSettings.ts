import {
  AccountSettings,
  getAccountSettings,
  updateAccountSettings,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';

export const queryKey = 'account-settings';

export const useAccountSettings = () =>
  useQuery<AccountSettings, APIError[]>(
    queryKey,
    getAccountSettings,
    queryPresets.oneTimeFetch
  );

export const useMutateAccountSettings = () => {
  return useMutation<AccountSettings, APIError[], Partial<AccountSettings>>(
    (data) => updateAccountSettings(data),
    {
      onSuccess: updateAccountSettingsData,
    }
  );
};

export const isManaged = () =>
  Boolean(queryClient.getQueryData<AccountSettings>(queryKey)?.managed);

export const accountBackupsEnabled = () =>
  Boolean(queryClient.getQueryData<AccountSettings>(queryKey)?.backups_enabled);

/**
 * updateAccountSettingsData is a function that we can use to directly update
 * the React Query store for account settings.
 * @todo In the future, we might want to make this generic and move it to
 * the react query base file so other query files can use it
 * @param data {Partial<AccountSettings>} account settings to update
 */
export const updateAccountSettingsData = (
  newData: Partial<AccountSettings>
): void => {
  queryClient.setQueryData(queryKey, (oldData: AccountSettings) => ({
    ...oldData,
    ...newData,
  }));
};
