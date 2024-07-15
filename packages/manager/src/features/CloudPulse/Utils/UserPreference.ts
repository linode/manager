import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { AclpConfig, AclpWidget } from '@linode/api-v4';

let userPreference: AclpConfig;
let timerId: ReturnType<typeof setTimeout>;
let mutateFn: any;

export const useLoadUserPreferences = () => {
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

const useUpdateUserPreference = (updatedData: AclpConfig) => {
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

export const updateWidgetPreference = (label: string, data: {}) => {
  if (!userPreference) {
    userPreference = {} as AclpConfig;
  }

  let widgets = userPreference.widgets;

  if (!widgets) {
    widgets = {};
    userPreference.widgets = widgets;
  }

  let widget = widgets[label];

  if (widget) {
    widget = { ...widget, ...data };
  } else {
    widget = { label, ...data } as AclpWidget;
  }

  widgets[label] = widget;

  debounce(userPreference);
};

// to avoid frequent preference update calls within 500 ms interval
const debounce = (updatedData: AclpConfig) => {
  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => useUpdateUserPreference(updatedData), 500);
};
