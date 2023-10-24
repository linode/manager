import { path } from 'ramda';
import * as React from 'react';

import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { isNullOrUndefined } from 'src/utilities/nullOrUndefined';

type PreferenceValue = boolean | number | string;

export interface PreferenceToggleProps<T> {
  preference: T;
  togglePreference: () => T;
}

interface RenderChildrenProps<T> {
  preference: T;
  togglePreference: () => T;
}

type RenderChildren<T> = (props: RenderChildrenProps<T>) => JSX.Element;

interface Props<T = PreferenceValue> {
  children: RenderChildren<T | undefined>;
  initialSetCallbackFn?: (value: T) => void;
  preferenceKey: string;
  preferenceOptions: [T, T];
  toggleCallbackFn?: (value: T) => void;
  toggleCallbackFnDebounced?: (value: T) => void;
  value?: T;
}

export const PreferenceToggle = <T extends unknown>(props: Props<T>) => {
  const {
    children,
    preferenceKey,
    preferenceOptions,
    toggleCallbackFn,
    toggleCallbackFnDebounced,
    value,
  } = props;

  const {
    data: preferences,
    error: preferencesError,
    refetch: refetchUserPreferences,
  } = usePreferences();

  const [currentlySetPreference, setPreference] = React.useState<T | undefined>(
    value ?? preferences?.[preferenceKey]
  );

  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  React.useEffect(() => {
    /**
     * This useEffect is strictly for when the app first loads
     * whether we have a preference error or preference data
     */

    /**
     * if for whatever reason we failed to get the preferences data
     * just fallback to some default (the first in the list of options).
     *
     * Do NOT try and PUT to the API - we don't want to overwrite other unrelated preferences
     */
    if (
      isNullOrUndefined(currentlySetPreference) &&
      !!preferencesError &&
      lastUpdated === 0
    ) {
      /**
       * get the first set of options
       */
      const preferenceToSet = preferenceOptions[0];
      setPreference(preferenceToSet);

      if (props.initialSetCallbackFn) {
        props.initialSetCallbackFn(preferenceToSet);
      }
    }

    /**
     * In the case of when we successfully retrieved preferences for the FIRST time,
     * set the state to what we got from the server. If the preference
     * doesn't exist yet in this user's payload, set defaults in local state.
     */
    if (
      isNullOrUndefined(currentlySetPreference) &&
      !!preferences &&
      lastUpdated === 0
    ) {
      const preferenceFromAPI = path<T>([preferenceKey], preferences);

      /**
       * this is the first time the user is setting the user preference
       *
       * if the API value is null or undefined, default to the first value that was passed to this component from props.
       */
      const preferenceToSet = isNullOrUndefined(preferenceFromAPI)
        ? preferenceOptions[0]
        : preferenceFromAPI;

      setPreference(preferenceToSet);

      /** run callback function if passed one */
      if (props.initialSetCallbackFn) {
        props.initialSetCallbackFn(preferenceToSet);
      }
    }
  }, [preferences, preferencesError]);

  React.useEffect(() => {
    /**
     * we only want to update local state if we already have something set in local state
     * setting the initial state is the responsibility of the first useEffect
     */
    if (!isNullOrUndefined(currentlySetPreference)) {
      const debouncedErrorUpdate = setTimeout(() => {
        /**
         * we have a preference error, so first GET the preferences
         * before trying to PUT them.
         *
         * Don't update anything if the GET fails
         */
        if (!!preferencesError && lastUpdated !== 0) {
          /** invoke our callback prop if we have one */
          if (
            toggleCallbackFnDebounced &&
            !isNullOrUndefined(currentlySetPreference)
          ) {
            toggleCallbackFnDebounced(currentlySetPreference);
          }
          refetchUserPreferences()
            .then((response) => {
              updateUserPreferences({
                ...response.data,
                [preferenceKey]: currentlySetPreference,
              }).catch(() => /** swallow the error */ null);
            })
            .catch(() => /** swallow the error */ null);
        } else if (
          !!preferences &&
          !isNullOrUndefined(currentlySetPreference) &&
          lastUpdated !== 0
        ) {
          /**
           * PUT to /preferences on every toggle, debounced.
           */
          updateUserPreferences({
            [preferenceKey]: currentlySetPreference,
          }).catch(() => /** swallow the error */ null);

          /** invoke our callback prop if we have one */
          if (
            toggleCallbackFnDebounced &&
            !isNullOrUndefined(currentlySetPreference)
          ) {
            toggleCallbackFnDebounced(currentlySetPreference);
          }
        } else if (lastUpdated === 0) {
          /**
           * this is the case where the app has just been mounted and the preferences are
           * being set in local state for the first time
           */
          setLastUpdated(Date.now());
        }
      }, 500);

      return () => clearTimeout(debouncedErrorUpdate);
    }

    return () => null;
  }, [currentlySetPreference]);

  const togglePreference = () => {
    /** first set local state to the opposite option */
    const newPreferenceToSet =
      currentlySetPreference === preferenceOptions[0]
        ? preferenceOptions[1]
        : preferenceOptions[0];

    /** set the preference in local state */
    setPreference(newPreferenceToSet);

    /** invoke our callback prop if we have one */
    if (toggleCallbackFn) {
      toggleCallbackFn(newPreferenceToSet);
    }

    return newPreferenceToSet;
  };

  return typeof children === 'function'
    ? children({ preference: currentlySetPreference, togglePreference })
    : null;
};
