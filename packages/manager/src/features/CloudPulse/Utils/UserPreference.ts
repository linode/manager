import { useRef } from 'react';

import { useMutatePreferences, usePreferences } from '@linode/queries';

import { DASHBOARD_ID, WIDGETS } from './constants';

import type { AclpConfig, AclpWidget } from '@linode/api-v4';

interface AclpPreferenceObject {
  isLoading: boolean;
  preferences: AclpConfig;
  updateGlobalFilterPreference: (data: AclpConfig) => void;
  updateWidgetPreference: (label: string, data: Partial<AclpWidget>) => void;
}

export const useAclpPreference = (): AclpPreferenceObject => {
  const { data: preferences, isLoading } = usePreferences();

  const { mutateAsync: updateFunction } = useMutatePreferences();

  const preferenceRef = useRef<AclpConfig>(preferences?.aclpPreference ?? {});

  if (preferences?.aclpPreference) {
    preferenceRef.current = preferences.aclpPreference;
  }
  /**
   *
   * @param data AclpConfig data to be updated in preferences
   */
  const updateGlobalFilterPreference = (data: AclpConfig) => {
    let currentPreferences = { ...preferenceRef.current };
    const keys = Object.keys(data);

    if (keys.includes(DASHBOARD_ID)) {
      currentPreferences = {
        ...data,
        [WIDGETS]: {},
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

  /**
   *
   * @param label label of the widget that should be updated
   * @param data AclpWidget data for the label that is to be updated in preference
   */
  const updateWidgetPreference = (label: string, data: Partial<AclpWidget>) => {
    // sync with latest preferences
    const updatedPreferences = {
      ...preferenceRef.current,
      [WIDGETS]: {
        ...(preferenceRef.current.widgets ?? {}),
      },
    };
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
    preferences: preferences?.aclpPreference ?? {},
    updateGlobalFilterPreference,
    updateWidgetPreference,
  };
};
