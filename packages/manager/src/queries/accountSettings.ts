import {
  AccountSettings,
  getAccountSettings,
  updateAccountSettings,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useProfile } from 'src/queries/profile';
import { queryKey } from './account';
import { queryClient, queryPresets } from './base';

export const useAccountSettings = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountSettings, APIError[]>(
    [queryKey, 'settings'],
    getAccountSettings,
    {
      ...queryPresets.oneTimeFetch,
      ...queryPresets.noRetry,
      enabled: !profile?.restricted,
    }
  );
};

export const useMutateAccountSettings = () => {
  return useMutation<AccountSettings, APIError[], Partial<AccountSettings>>(
    (data) => updateAccountSettings(data),
    {
      onSuccess: updateAccountSettingsData,
    }
  );
};

export const getIsManaged = () =>
  Boolean(
    queryClient.getQueryData<AccountSettings>([queryKey, 'settings'])?.managed
  );

export const getAccountBackupsEnabled = () =>
  Boolean(
    queryClient.getQueryData<AccountSettings>([queryKey, 'settings'])
      ?.backups_enabled
  );

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
  queryClient.setQueryData(
    [queryKey, 'settings'],
    (oldData: AccountSettings) => ({
      ...oldData,
      ...newData,
    })
  );
};
