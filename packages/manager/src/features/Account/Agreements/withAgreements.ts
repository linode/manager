import { Agreements } from '@linode/api-v4/lib';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useAccountAgreements } from 'src/queries/account/agreements';
import { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface AgreementsProps {
  agreements: UseQueryResult<Agreements, FormattedAPIError[]>;
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
