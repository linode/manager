import { updateUserPreferences } from '@linode/api-v4';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type { APIError } from '@linode/api-v4';
import type { ManagerPreferences } from '@linode/utilities';
import type { QueryClient } from '@tanstack/react-query';

/**
 * `PUT /profile/preferences` replaces the entire blob. Merge mode must spread a real base object.
 * This rejects `undefined` / null / arrays — not an empty object `{}`.
 * An empty object is still dangerous if it *should* have contained server keys (stale cache); we
 * address that by calling `getUserPreferences()` in the mutation (without writing the React Query
 * cache) so optimistic UI from `onMutate` is not overwritten by a mid-flight GET.
 */
export const PREFERENCES_MERGE_FAILED: APIError[] = [
  {
    reason:
      'Preferences could not be loaded, so your change was not saved. Refresh the page and try again.',
  },
];

const isPreferencesMergeBase = (
  value: ManagerPreferences | undefined,
): value is ManagerPreferences =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  !Array.isArray(value);

// Reference for this pattern: https://tkdodo.eu/blog/react-query-data-transformations#3-using-the-select-option
export const usePreferences = <TData = ManagerPreferences>(
  select?: (data: ManagerPreferences | undefined) => TData,
  enabled = true,
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
      const preferencesQueryOptions = queryOptions(profileQueries.preferences);
      const existingPreferences = await queryClient.ensureQueryData(
        preferencesQueryOptions,
      );
      if (!isPreferencesMergeBase(existingPreferences)) {
        throw PREFERENCES_MERGE_FAILED;
      }
      return updateUserPreferences({ ...existingPreferences, ...data });
    },
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: profileQueries.preferences.queryKey,
      }),
    onMutate: (data) => updatePreferenceData(data, replace, queryClient),
  });
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>,
  replace: boolean,
  queryClient: QueryClient,
): void => {
  queryClient.setQueryData<ManagerPreferences>(
    profileQueries.preferences.queryKey,
    (oldData) => {
      if (replace) {
        return { ...newData };
      }
      if (!isPreferencesMergeBase(oldData)) {
        return oldData;
      }
      return { ...oldData, ...newData };
    },
  );
};
