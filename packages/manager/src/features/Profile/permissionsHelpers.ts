import {
  GlobalGrantTypes,
  Grants,
  GrantType,
} from '@linode/api-v4/lib/account';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/profile';
import { Profile } from '@linode/api-v4/lib/profile';

export const isRestrictedUser = () =>
  queryClient.getQueryData<Profile>(queryKey)?.restricted || false;

export const hasGrant = (grant: GlobalGrantTypes, grants?: Grants) => {
  if (!grants) {
    return (
      queryClient.getQueryData<Grants>(`${queryKey}-grants`)?.global?.[grant] ||
      false
    );
  }
  return grants.global?.[grant] || false;
};

export const getGrants = (grants: Grants | undefined, grant: GrantType) => {
  if (!grants) {
    return (
      queryClient.getQueryData<Grants>(`${queryKey}-grants`)?.[grant] || []
    );
  }
  return grants?.[grant] || [];
};
