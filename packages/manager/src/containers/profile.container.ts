import { Grants, Profile } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { UseQueryResult } from 'react-query';

import { useGrants, useProfile } from 'src/queries/profile';

export interface WithProfileProps {
  grants: UseQueryResult<Grants, APIError[]>;
  profile: UseQueryResult<Profile, APIError[]>;
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
