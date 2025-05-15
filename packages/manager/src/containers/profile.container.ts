import { useGrants, useProfile } from '@linode/queries';
import * as React from 'react';

import type { Grants, Profile } from '@linode/api-v4/lib';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryResult } from '@tanstack/react-query';

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
