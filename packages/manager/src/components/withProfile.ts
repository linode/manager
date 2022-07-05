import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { useGrants, useProfile } from 'src/queries/profile';
import { Grants, Profile } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';

export interface ProfileProps {
  profile: UseQueryResult<Profile, APIError[]>;
  grants: UseQueryResult<Grants, APIError[]>;
}

export default (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const profile = useProfile();
    const grants = useGrants();

    return React.createElement(Component, {
      ...props,
      profile,
      grants,
    });
  };
};
