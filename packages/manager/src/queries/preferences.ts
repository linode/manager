import {
  getUserPreferences,
  updateUserPreferences,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { ManagerPreferences } from 'src/types/ManagerPreferences';

import { queryPresets } from './base';

export const queryKey = 'preferences';

export const usePreferences = (enabled = true) =>
  useQuery<ManagerPreferences, APIError[]>(queryKey, getUserPreferences, {
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
  >(
    (data) =>
      updateUserPreferences({
        ...(!replace && preferences !== undefined ? preferences : {}),
        ...data,
      }),
    {
      onMutate: (data) => updatePreferenceData(data, replace, queryClient),
    }
  );
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>,
  replace: boolean,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData<ManagerPreferences>(
    queryKey,
    (oldData: ManagerPreferences) => ({
      ...(!replace ? oldData : {}),
      ...newData,
    })
  );
};
