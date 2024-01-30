import { useGrants } from 'src/queries/profile';

import type { GrantLevel, GrantType, Grants } from '@linode/api-v4';

/**
 * This hook verifies if a user with restricted access can edit specific cloud resources (Linodes, NodeBalancers, Volumes, etc.).
 * Admin-created resources may be restricted, but those created by the restricted user are editable.
 */
export const useIsResourceRestricted = ({
  grantLevel,
  grantType,
  id,
}: {
  grantLevel?: GrantLevel;
  grantType: GrantType;
  grants?: Grants;
  id: number | undefined;
}) => {
  const { data: grants } = useGrants();
  if (!grants) {
    return false;
  }
  return grants[grantType].some(
    (grant) => grant.id === id && grant.permissions === grantLevel
  );
};
