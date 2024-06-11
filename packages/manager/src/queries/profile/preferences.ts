import { updateUserPreferences } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type { QueryClient } from '@tanstack/react-query';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const usePreferences = (enabled = true) =>
  useQuery<ManagerPreferences, FormattedAPIError[]>({
    ...profileQueries.preferences,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useMutatePreferences = (replace = false) => {
  const { data: preferences } = usePreferences(!replace);
  const queryClient = useQueryClient();

  return useMutation<
    ManagerPreferences,
    FormattedAPIError[],
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
