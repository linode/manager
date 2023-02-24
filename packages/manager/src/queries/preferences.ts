import {
  getUserPreferences,
  updateUserPreferences,
  UserPreferences,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { ManagerPreferences } from 'src/types/ManagerPreferences';
import { queryClient, queryPresets } from './base';

export const queryKey = 'preferences';

export const usePreferences = (enabled = true) =>
  useQuery<UserPreferences, APIError[]>(queryKey, getUserPreferences, {
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useMutatePreferences = (replace?: boolean) => {
  const { data: preferences } = usePreferences(!replace);

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
      onMutate: (data) => updatePreferenceData(data, replace),
    }
  );
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>,
  replace?: boolean
): void => {
  queryClient.setQueryData<ManagerPreferences>(
    queryKey,
    (oldData: ManagerPreferences) => ({
      ...(!replace ? oldData : {}),
      ...newData,
    })
  );
};
