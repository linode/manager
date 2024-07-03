import { getUserPreferences, updateUserPreferences } from '@linode/api-v4';

import type { AclpConfig } from '@linode/api-v4';

let userPreference: AclpConfig;
let timerId: ReturnType<typeof setTimeout>;

export const loadUserPreference = async () => {
  const data = await getUserPreferences();

  if (!data || !data.aclpPreference) {
    userPreference = {} as AclpConfig;
  } else {
    userPreference = { ...data.aclpPreference };
  }
  return data;
};

export const getUserPreferenceObject = () => {
  return { ...userPreference };
};

const updateUserPreference = async (updatedData: AclpConfig) => {
  const data = await getUserPreferences();
  return await updateUserPreferences({ ...data, aclpPreference: updatedData });
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
