import {
  getUserPreferences,
  updateUserPreferences,
  UserPreferences,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';

export const queryKey = 'preferences';

export const usePreferences = () =>
  useQuery<UserPreferences, APIError[]>(queryKey, getUserPreferences, {
    ...queryPresets.oneTimeFetch,
  });

export const useMutatePreferences = () => {
  return useMutation<UserPreferences, APIError[], Partial<UserPreferences>>(
    updateUserPreferences,
    { onMutate: updatePreferenceData }
  );
};

export const updatePreferenceData = (
  newData: Partial<UserPreferences>
): void => {
  queryClient.setQueryData(queryKey, (oldData: UserPreferences) => ({
    ...oldData,
    ...newData,
  }));
};
