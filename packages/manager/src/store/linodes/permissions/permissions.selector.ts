import { Grant, GrantLevel, Grants } from '@linode/api-v4/lib/account';

export const getPermissionsForLinode = (
  grants: Grants | null,
  linodeId: number
): GrantLevel => {
  if (grants === null) {
    return 'read_write';
  } // Default to write access
  const linodesGrants = grants.linode;
  const linodeGrants = linodesGrants.find(
    (grant: Grant) => grant.id === linodeId
  );

  return linodeGrants ? linodeGrants.permissions : 'read_write';
};
