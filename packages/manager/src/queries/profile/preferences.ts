import { updateUserPreferences } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type { APIError } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const usePreferences = <TData = ManagerPreferences>(
  select?: (data: ManagerPreferences | undefined) => TData,
  enabled = true
) =>
  useQuery({
    ...profileQueries.preferences,
    ...queryPresets.oneTimeFetch,
    enabled,
    select,
  });

export const useMutatePreferences = (replace = false) => {
  const queryClient = useQueryClient();

  return useMutation<
    ManagerPreferences,
    APIError[],
    Partial<ManagerPreferences>
  >({
    async mutationFn(data) {
      if (replace) {
        return updateUserPreferences(data);
      }
      const existingPreferences = await queryClient.ensureQueryData<ManagerPreferences>(
        profileQueries.preferences
      );
      return updateUserPreferences({ ...existingPreferences, ...data });
    },
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
