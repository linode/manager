import {
  AccountSettings,
  updateAccountSettings,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

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
  queryClient: QueryClient
): void => {
  queryClient.setQueryData<AccountSettings>(
    accountQueries.settings.queryKey,
    (oldData: AccountSettings) => ({
      ...oldData,
      ...newData,
    })
  );
};
