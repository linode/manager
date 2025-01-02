import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

interface RenderChildrenProps<T> {
  preference: NonNullable<T>;
  togglePreference: () => NonNullable<T>;
}

type RenderChildren<T> = (props: RenderChildrenProps<T>) => JSX.Element;

interface Props<Key extends keyof ManagerPreferences> {
  children: RenderChildren<ManagerPreferences[Key]>;
  initialSetCallbackFn?: (value: ManagerPreferences[Key]) => void;
  preferenceKey: Key;
  preferenceOptions: [ManagerPreferences[Key], ManagerPreferences[Key]];
  toggleCallbackFn?: (value: ManagerPreferences[Key]) => void;
  value?: ManagerPreferences[Key];
}

/**
 * @deprecated There are more simple ways to use preferences. Look into using `usePreferences` directly.
 */
export const PreferenceToggle = <Key extends keyof ManagerPreferences>(
  props: Props<Key>
) => {
  const {
    children,
    preferenceKey,
    preferenceOptions,
    toggleCallbackFn,
    value,
  } = props;

  const { data: preference } = usePreferences(
    (preferences) => preferences?.[preferenceKey]
  );

  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  const togglePreference = () => {
    let newPreferenceToSet: ManagerPreferences[Key];

    if (preference === undefined) {
      // Because we default to preferenceOptions[0], toggling with no preference should pick preferenceOptions[1]
      newPreferenceToSet = preferenceOptions[1];
    } else if (preference === preferenceOptions[0]) {
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

    return newPreferenceToSet!;
  };

  return children({
    preference: value ?? preference ?? preferenceOptions[0]!,
    togglePreference,
  });
};
