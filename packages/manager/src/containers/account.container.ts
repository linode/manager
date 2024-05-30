import { Account } from '@linode/api-v4/lib';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useAccount } from 'src/queries/account/account';
import { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface WithAccountProps {
  account: UseQueryResult<Account, FormattedAPIError[]>;
}

export const withAccount = <Props>(
  Component: React.ComponentType<Props & WithAccountProps>
) => {
  return (props: Props) => {
    const account = useAccount();

    return React.createElement(Component, {
      ...props,
      account,
    });
  };
};
