import { equals, path } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import withPreferences, {
  PreferencesActionsProps
} from 'src/containers/preferences.container';

type PreferenceValue = boolean | string | number;

export interface ToggleProps<T> {
  preference: T;
  togglePreference: () => T;
}

interface RenderChildrenProps {
  preference: PreferenceValue;
  togglePreference: () => PreferenceValue;
}

type RenderChildren = (props: RenderChildrenProps) => JSX.Element;

interface Props {
  preferenceKey: string;
  preferenceOptions: [PreferenceValue, PreferenceValue];
  value?: PreferenceValue;
  toggleCallbackFn?: (value: PreferenceValue) => void;
  children: RenderChildren;
}

type CombinedProps = Props & PreferenceProps & PreferencesActionsProps;

const PreferenceToggle: React.FC<CombinedProps> = props => {
  const {
    value,
    preferenceError,
    preferenceKey,
    preferenceOptions,
    toggleCallbackFn,
    children,
    preferences
  } = props;

  React.useEffect(() => {
    /** make sure out overridden value appears int the list of options to toggle */
    if (
      !!value &&
      !preferenceOptions.find(eachOption => eachOption === value)
    ) {
      throw new Error(
        'Preference Toggle: The passed "value" prop must appear in the list of options'
      );
    }
  }, []);

  /** will be undefined and render-block children unless otherwise specified */
  const [currentlySetPreference, setPreference] = React.useState<
    PreferenceValue | undefined
  >(value);
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  React.useEffect(() => {
    /**
     * This useEffect is strictly for when the app first loads
     * whether we have a preference error or preference data
     */

    /**
     * if for whatever reason we failed to get the preferences data
     * just fallback to some defaults (the first in the list of options).
     *
     * Do NOT try and PUT to the API - we don't want to overwrite other unrelated preferences
     */
    if (
      !currentlySetPreference &&
      !!props.preferenceError &&
      lastUpdated === 0
    ) {
      setPreference(preferenceOptions[0]);

      setLastUpdated(Date.now());
    }

    /**
     * In the case of when we successfully retrieved preferences for the FIRST time,
     * set the state to what we got from the server. If the preference
     * doesn't exist yet in this user's payload, set defaults in local state.
     */
    if (!currentlySetPreference && !!props.preferences && lastUpdated === 0) {
      const preferenceFromAPI = path<PreferenceValue>(
        [preferenceKey],
        props.preferences
      );

      /** this is the first time the user is setting the user preference */
      const preferenceToSet = !preferenceFromAPI
        ? preferenceOptions[0]
        : preferenceFromAPI;

      setPreference(preferenceToSet);

      /** set local state so we don't repeat any of this previous behavior */
      setLastUpdated(Date.now());
    }
  }, [props.preferenceError, props.preferences]);

  React.useEffect(() => {
    const debouncedErrorUpdate = setTimeout(() => {
      /**
       * we have a preference error, so first GET the preferences
       * before trying to PUT them.
       *
       * Don't update anything if the GET fails
       */
      if (!!preferenceError) {
        props
          .getUserPreferences()
          .then(response => {
            props.updateUserPreferences({
              ...response.preferences,
              [preferenceKey]: currentlySetPreference
            });
          })
          .catch(() => /** swallow the error */ null);
      } else {
        /**
         * PUT to /preferences on every toggle, debounced.
         */
        if (
          !!preferences &&
          currentlySetPreference
          // && preferencesHaveBeenUpdated(props.preferences, theme, spacing)
        ) {
          props.updateUserPreferences({
            ...props.preferences,
            [preferenceKey]: currentlySetPreference
          });
        }
      }
    }, 750);

    return () => clearTimeout(debouncedErrorUpdate);
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

  /**
   * render-block the children. We can prevent
   * render-blocking by passing a default value as a prop
   *
   * So if you want to handle local state outside of this component,
   * you can do so and pass the value explicitly with the _value_ prop
   */
  if (!currentlySetPreference) {
    return null;
  }

  return typeof children === 'function'
    ? children({ preference: currentlySetPreference, togglePreference })
    : null;
};

interface PreferenceProps {
  preferences?: Record<string, any>;
  preferenceError?: any;
  preferencesLastUpdated: number;
}

const memoized = (component: React.FC<CombinedProps>) =>
  React.memo(component, (prevProps, nextProps) => {
    /**
     * only prevent rendering if the preferences AND profileError
     * went from being defined to defined or vise versa.
     *
     * we don't care to re-render if the preferences have been updated in Redux
     * state. All the relevant preference state will be handled in the component.
     * This component only cares about what the preferences are on app load.
     */
    return (
      !(!prevProps.preferences && !!nextProps.preferences) &&
      !(!!prevProps.preferences && !nextProps.preferences) &&
      !(!prevProps.preferenceError && !!nextProps.preferenceError) &&
      !(!!prevProps.preferenceError && !nextProps.preferenceError) &&
      equals(prevProps.children, nextProps.children) &&
      /** we only care what the server tells us on app load */
      !(
        prevProps.preferencesLastUpdated === 0 &&
        nextProps.preferencesLastUpdated !== 0
      )
    );
  });

export default compose<CombinedProps, Props>(
  withPreferences<PreferenceProps, Props>(
    (ownProps, { data: preferences, error, lastUpdated }) => ({
      preferences,
      preferenceError: error,
      preferencesLastUpdated: lastUpdated
    })
  ),
  memoized
)(PreferenceToggle as React.FC<CombinedProps>);
