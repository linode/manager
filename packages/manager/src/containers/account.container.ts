import { Account } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { UseQueryResult } from 'react-query';

import { useAccount } from 'src/queries/account';

export interface WithAccountProps {
  account: UseQueryResult<Account, APIError[]>;
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
