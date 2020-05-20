import { Grant, GrantLevel } from '@linode/api-v4/lib/account';
import { Profile } from '@linode/api-v4/lib/profile';
import { pathOr } from 'ramda';

export const getPermissionsForLinode = (
  profile: Profile | null,
  linodeId: number
): GrantLevel => {
  if (profile === null) {
    return 'read_write';
  } // Default to write access
  const linodesGrants = pathOr([], ['grants', 'linode'], profile);
  const linodeGrants = linodesGrants.find(
    (grant: Grant) => grant.id === linodeId
  );

  return linodeGrants ? linodeGrants.permissions : 'read_write';
};
