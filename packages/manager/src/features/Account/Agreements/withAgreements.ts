import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { useAccountAgreements } from 'src/queries/accountAgreements';
import { Agreements } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';

export interface AgreementsProps {
  agreements: UseQueryResult<Agreements, APIError[]>;
}

export default (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const agreements = useAccountAgreements();

    return React.createElement(Component, {
      ...props,
      agreements,
    });
  };
};
