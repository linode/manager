import { pathOr } from 'ramda';

export const getPermissionsForLinode = (
  profile: Linode.Profile | null,
  linodeId: number
): Linode.GrantLevel => {
  if (profile === null) {
    return 'read_write';
  } // Default to write access
  const linodesGrants = pathOr([], ['grants', 'linode'], profile);
  const linodeGrants = linodesGrants.find(
    (grant: Linode.Grant) => grant.id === linodeId
  );

  return linodeGrants ? linodeGrants.permissions : 'read_write';
};
