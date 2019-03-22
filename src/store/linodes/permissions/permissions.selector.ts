import { pathOr } from 'ramda';
import { State } from 'src/store/profile/profile.reducer';

export const getPermissionsForLinode = (
  profile: State,
  linodeId: number
): Linode.GrantLevel => {
  const linodesGrants = pathOr([], ['data', 'grants', 'linode'], profile);
  const linodeGrants = linodesGrants.find(
    (grant: Linode.Grant) => grant.id === linodeId
  );

  return linodeGrants ? linodeGrants.permissions : 'read_write';
};
