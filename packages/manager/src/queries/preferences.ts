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

const adaptPreferences = <T>(
  func: (...args: T[]) => Promise<UserPreferences>
) => (...args: T[]) =>
  func(...args).then((preferences) => preferences as ManagerPreferences);

export const usePreferences = (enabled = true) =>
  useQuery<ManagerPreferences, APIError[]>(
    queryKey,
    adaptPreferences(getUserPreferences),
    {
      ...queryPresets.oneTimeFetch,
      enabled,
    }
  );

export const useMutatePreferences = () => {
  return useMutation<
    ManagerPreferences,
    APIError[],
    Partial<ManagerPreferences>
  >(adaptPreferences(updateUserPreferences), {
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
