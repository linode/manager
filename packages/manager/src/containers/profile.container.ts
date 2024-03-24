import { Grants, Profile } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { useGrants, useProfile } from 'src/queries/profile';

export interface WithProfileProps {
  grants: UseQueryResult<Grants, APIError[]>;
  profile: UseQueryResult<Profile, APIError[]>;
}

export const withProfile = <P extends {}>(
  Component: React.ComponentType<WithProfileProps>
) => {
  return (props: P) => {
    const profile = useProfile();
    const grants = useGrants();

    return React.createElement(Component, {
      ...props,
      grants,
      profile,
    });
  };
};
