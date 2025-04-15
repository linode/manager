import { useMutatePreferences, usePreferences } from '@linode/queries';
import { useRef } from 'react';

import { DASHBOARD_ID, WIDGETS } from './constants';

import type { AclpConfig, AclpWidget } from '@linode/api-v4';
import type { ManagerPreferences } from '@linode/utilities';

interface AclpPreferenceObject {
  isLoading: boolean;
  preferences: AclpConfig;
  updateGlobalFilterPreference: (data: AclpConfig) => void;
  updateWidgetPreference: (label: string, data: Partial<AclpWidget>) => void;
}

interface PreferenceToggleObject<K extends keyof ManagerPreferences> {
  defaultValue: ManagerPreferences[K];
  options: [ManagerPreferences[K], ManagerPreferences[K]];
  preferenceKey: K;
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

/**
 *
 * @param key key of the preference to be toggled
 * @param options options for the preference
 * @param defaultValue default value of the preference
 */
export const usePreferencesToggle = <K extends keyof ManagerPreferences>({
  preferenceKey,
  options,
  defaultValue,
}: PreferenceToggleObject<K>) => {
  const { data: preference } = usePreferences(
    (preferences: ManagerPreferences) => preferences?.[preferenceKey]
  );

  const { mutateAsync: updateFunction } = useMutatePreferences();

  /**
   *
   * @returns the toggled preference value
   */
  const toggle = () => {
    let newPreferenceToSet: ManagerPreferences[K];

    // if the preference is undefined, set it to false
    if (preference === undefined) {
      newPreferenceToSet = defaultValue;
    } else if (preference === options[0]) {
      newPreferenceToSet = options[1];
    } else {
      newPreferenceToSet = options[0];
    }

    updateFunction({
      [preferenceKey]: newPreferenceToSet,
    }).catch(() => null);

    return newPreferenceToSet;
  };

  return {
    preference,
    toggle,
  };
};
