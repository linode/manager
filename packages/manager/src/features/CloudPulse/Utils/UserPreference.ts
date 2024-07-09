/* eslint-disable react-hooks/rules-of-hooks */
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { AclpConfig } from '@linode/api-v4';

let userPreference: AclpConfig;
let timerId: ReturnType<typeof setTimeout>;
let mutateFn: any;

export const loadUserPreferences = () => {
  if (userPreference) {
    return { isLoading: false };
  }
  const { data: preferences, isError, isLoading } = usePreferences();

  const { mutate } = useMutatePreferences();

  if (isLoading) {
    return { isLoading };
  }
  mutateFn = mutate;

  if (isError || !preferences) {
    userPreference = {} as AclpConfig;
  } else {
    userPreference = preferences.aclpPreference ?? {};
  }

  return { isLoading };
};

export const getUserPreferenceObject = () => {
  return { ...userPreference };
};

const updateUserPreference = (updatedData: AclpConfig) => {
  if (mutateFn) {
    mutateFn({ aclpPreference: updatedData });
  }
};

export const updateGlobalFilterPreference = (data: {}) => {
  if (!userPreference) {
    userPreference = {} as AclpConfig;
  }
  userPreference = { ...userPreference, ...data };

  debounce(userPreference);
};

// to avoid frequent preference update calls within 500 ms interval
const debounce = (updatedData: AclpConfig) => {
  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => updateUserPreference(updatedData), 500);
};
