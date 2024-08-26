import { useRef } from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';


import { DASHBOARD_ID, TIME_DURATION } from './constants';

import type { AclpWidget } from '@linode/api-v4';

export const useAclpPreference = () => {
  const { data: preferences, isLoading } = usePreferences();

  const { mutateAsync: updateFunction } = useMutatePreferences();

  const preferenceRef = useRef({ ...(preferences?.aclpPreference ?? {}) });
  const updateGlobalFilterPreference = (data: {}) => {
    let currentPreferences = { ...preferenceRef.current };
    const keys = Object.keys(data);

    if (keys.includes(DASHBOARD_ID)) {
      currentPreferences = {
        ...data,
        [TIME_DURATION]: currentPreferences[TIME_DURATION],
      };
    } else {
      currentPreferences = {
        ...currentPreferences,
        ...data,
      };
    }
    preferenceRef.current = currentPreferences;
    updateFunction({ aclpPreference: currentPreferences });
  };

  const updateWidgetPreference = (label: string, data: Partial<AclpWidget>) => {
    const updatedPreferences = { ...preferenceRef.current };

    if (!updatedPreferences.widgets) {
      updatedPreferences.widgets = {};
    }

    updatedPreferences.widgets[label] = {
      ...updatedPreferences.widgets[label],
      label,
      ...data,
    };
    preferenceRef.current = updatedPreferences;
    updateFunction({ aclpPreference: updatedPreferences });
  };
  return {
    isLoading,
    preferences: preferenceRef.current,
    updateGlobalFilterPreference,
    updateWidgetPreference,
  };
};
