import { Grants, Profile } from '@linode/api-v4/lib';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useGrants, useProfile } from 'src/queries/profile';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface WithProfileProps {
  grants: UseQueryResult<Grants, FormattedAPIError[]>;
  profile: UseQueryResult<Profile, FormattedAPIError[]>;
}

export const withProfile = <Props>(
  Component: React.ComponentType<Props & WithProfileProps>
) => {
  return (props: Props) => {
    const profile = useProfile();
    const grants = useGrants();

    return React.createElement(Component, {
      ...props,
      grants,
      profile,
    });
  };
};
