import { updateUserPreferences } from '@linode/api-v4';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { ManagerPreferences } from 'src/types/ManagerPreferences';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type { APIError } from '@linode/api-v4';

export const usePreferences = (enabled = true) =>
  useQuery<ManagerPreferences, APIError[]>({
    ...profileQueries.preferences,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useMutatePreferences = (replace = false) => {
  const { data: preferences } = usePreferences(!replace);
  const queryClient = useQueryClient();

  return useMutation<
    ManagerPreferences,
    APIError[],
    Partial<ManagerPreferences>
  >({
    mutationFn: (data) =>
      updateUserPreferences({
        ...(!replace && preferences !== undefined ? preferences : {}),
        ...data,
      }),
    onMutate: (data) => updatePreferenceData(data, replace, queryClient),
  });
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>,
  replace: boolean,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData<ManagerPreferences>(
    profileQueries.preferences.queryKey,
    (oldData) => ({
      ...(!replace ? oldData : {}),
      ...newData,
    })
  );
};
