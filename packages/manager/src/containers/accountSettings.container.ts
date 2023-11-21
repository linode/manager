import { AccountSettings } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { useAccountSettings } from 'src/queries/accountSettings';

export interface WithAccountSettingsProps {
  accountSettings: UseQueryResult<AccountSettings, APIError[]>;
}

export const withAccountSettings = <Props>(
  Component: React.ComponentType<Props & WithAccountSettingsProps>
) => {
  return (props: Props) => {
    const accountSettings = useAccountSettings();

    return React.createElement(Component, {
      ...props,
      accountSettings,
    });
  };
};
