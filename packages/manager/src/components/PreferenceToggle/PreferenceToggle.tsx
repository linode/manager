import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

export interface PreferenceToggleProps<T> {
  preference: T;
  togglePreference: () => T;
}

interface RenderChildrenProps<T> {
  preference: T;
  togglePreference: () => T;
}

type RenderChildren<T> = (props: RenderChildrenProps<T>) => JSX.Element;

interface Props<T> {
  children: RenderChildren<T>;
  initialSetCallbackFn?: (value: T) => void;
  preferenceKey: string;
  preferenceOptions: [T, T];
  toggleCallbackFn?: (value: T) => void;
  value?: T;
}

export const PreferenceToggle = <T,>(props: Props<T>) => {
  const {
    children,
    preferenceKey,
    preferenceOptions,
    toggleCallbackFn,
    value,
  } = props;

  const { data: preferences } = usePreferences();

  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  const togglePreference = () => {
    let newPreferenceToSet: T;

    if (preferences?.[preferenceKey] === undefined) {
      // Because we default to preferenceOptions[0], toggling with no preference should pick preferenceOptions[1]
      newPreferenceToSet = preferenceOptions[1];
    } else if (preferences[preferenceKey] === preferenceOptions[0]) {
      newPreferenceToSet = preferenceOptions[1];
    } else {
      newPreferenceToSet = preferenceOptions[0];
    }

    updateUserPreferences({
      [preferenceKey]: newPreferenceToSet,
    }).catch(() => /** swallow the error */ null);

    /** invoke our callback prop if we have one */
    if (toggleCallbackFn) {
      toggleCallbackFn(newPreferenceToSet);
    }

    return newPreferenceToSet;
  };

  return children({
    preference: value ?? preferences?.[preferenceKey] ?? preferenceOptions[0],
    togglePreference,
  });
};
