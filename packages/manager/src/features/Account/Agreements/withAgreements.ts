import { Agreements } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { useAccountAgreements } from 'src/queries/account/agreements';

export interface AgreementsProps {
  agreements: UseQueryResult<Agreements, APIError[]>;
}

// P represents the props of the component we're wrapping
export default <P extends AgreementsProps>(
  Component: React.ComponentType<P>
) => {
  return (props: Omit<P, keyof AgreementsProps>) => {
    const agreements = useAccountAgreements();

    return React.createElement(Component, {
      ...props,
      agreements,
    } as P);
  };
};
