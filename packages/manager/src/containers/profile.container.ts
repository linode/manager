import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { useGrants, useProfile } from 'src/queries/profile';
import { Grants, Profile } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';

export interface WithProfileProps {
  profile: UseQueryResult<Profile, APIError[]>;
  grants: UseQueryResult<Grants, APIError[]>;
}

export const withProfile = <Props>(
  Component: React.ComponentType<Props & WithProfileProps>
) => {
  return (props: Props) => {
    const profile = useProfile();
    const grants = useGrants();

    return React.createElement(Component, {
      ...props,
      profile,
      grants,
    });
  };
};
