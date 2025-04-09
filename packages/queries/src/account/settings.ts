import { updateAccountSettings } from '@linode/api-v4/lib/account';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useProfile } from '../profile';
import { accountQueries } from './queries';

import type { AccountSettings } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';
import type { QueryClient } from '@tanstack/react-query';

export const useAccountSettings = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountSettings, APIError[]>({
    ...accountQueries.settings,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccountSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<AccountSettings, APIError[], Partial<AccountSettings>>({
    mutationFn: updateAccountSettings,
    onSuccess: (newData) => updateAccountSettingsData(newData, queryClient),
  });
};

/**
 * updateAccountSettingsData is a function that we can use to directly update
 * the React Query store for account settings.
 * @todo In the future, we might want to make this generic and move it to
 * the react query base file so other query files can use it
 * @param data {Partial<AccountSettings>} account settings to update
 */
export const updateAccountSettingsData = (
  newData: Partial<AccountSettings>,
  queryClient: QueryClient,
): void => {
  queryClient.setQueryData<AccountSettings>(
    accountQueries.settings.queryKey,
    (oldData: AccountSettings) => ({
      ...oldData,
      ...newData,
    }),
  );
};
