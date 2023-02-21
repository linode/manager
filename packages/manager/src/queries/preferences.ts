import {
  getUserPreferences,
  updateUserPreferences,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { ManagerPreferences } from 'src/types/ManagerPreferences';
import { queryClient, queryPresets } from './base';

export const queryKey = 'preferences';

export const usePreferences = (enabled = true) =>
  useQuery<ManagerPreferences, APIError[]>(queryKey, getUserPreferences, {
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useMutatePreferences = () => {
  return useMutation<
    ManagerPreferences,
    APIError[],
    Partial<ManagerPreferences>
  >(updateUserPreferences, {
    onMutate: updatePreferenceData,
  });
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>
): void => {
  queryClient.setQueryData(queryKey, (oldData: ManagerPreferences) => ({
    ...oldData,
    ...newData,
  }));
};
