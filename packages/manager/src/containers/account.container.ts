import { Account } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useAccount } from 'src/queries/account/account';

export interface WithAccountProps {
  account: UseQueryResult<Account, APIError[]>;
}

export const withAccount = <P extends {}>(
  Component: React.ComponentType<WithAccountProps>
) => {
  return (props: P) => {
    const account = useAccount();

    return React.createElement(Component, {
      ...props,
      account,
    });
  };
};
