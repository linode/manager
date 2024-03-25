import React from 'react';

import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
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

export interface Props extends PreferencesActionsProps, PreferencesStateProps {}

export interface ComponentProps
  extends Props,
    PreferencesStateProps,
    PreferencesActionsProps {}

const withPreferences = <Props>(
  Component: React.ComponentType<ComponentProps>
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
