import { AccountSettings } from '@linode/api-v4/lib';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useAccountSettings } from 'src/queries/account/settings';
import { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface WithAccountSettingsProps {
  accountSettings: UseQueryResult<AccountSettings, FormattedAPIError[]>;
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
