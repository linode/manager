import React from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';
import { ManagerPreferences } from 'src/types/ManagerPreferences';
export interface PreferencesStateProps {
  preferences?: ManagerPreferences;
}

export interface PreferencesActionsProps {
  getUserPreferences: () => Promise<ManagerPreferences>;
  updateUserPreferences: (
    params: ManagerPreferences
  ) => Promise<ManagerPreferences>;
}

export type Props = PreferencesActionsProps & PreferencesStateProps;

const withPreferences = <Props>(
  Component: React.ComponentType<
    Props & PreferencesStateProps & PreferencesActionsProps
  >
) => (props: Props) => {
  const { data: preferences, refetch } = usePreferences();
  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  return React.createElement(Component, {
    ...props,
    getUserPreferences: () =>
      refetch().then(({ data }) => data ?? Promise.reject()),
    preferences,
    updateUserPreferences,
  });
};

export default withPreferences;
