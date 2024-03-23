import { AccountSettings } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useAccountSettings } from 'src/queries/account/settings';

export interface WithAccountSettingsProps {
  accountSettings: UseQueryResult<AccountSettings, APIError[]>;
}

interface ComponentProps<P> extends WithAccountSettingsProps {
  componentProps: P;
}

export const withAccountSettings = <P extends {}>(
  Component: React.ComponentType<ComponentProps<P>>
) => {
  return (props: P) => {
    const accountSettings = useAccountSettings();

    return React.createElement(Component, {
      accountSettings,
      componentProps: props,
    });
  };
};
