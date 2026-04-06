import { useAccountAgreements } from '@linode/queries';
import * as React from 'react';

import type { Agreements } from '@linode/api-v4/lib';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryResult } from '@tanstack/react-query';

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
