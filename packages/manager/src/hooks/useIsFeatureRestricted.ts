import { useEffect, useState } from 'react';

import { useGrants } from 'src/queries/profile';

import type { Grant, GrantLevel, GrantType, Grants } from '@linode/api-v4';

/**
 * This hook verifies if a user with restricted access can edit specific cloud resources (Linodes, NodeBalancers, Volumes, etc.).
 * Admin-created resources may be restricted, but those created by the restricted user are editable.
 */
export const useIsFeatureRestricted = ({
  grantLevel = 'read_only',
  grantType,
  id,
}: {
  grantLevel?: GrantLevel;
  grantType: GrantType;
  grants?: Grants;
  id: number | undefined;
}) => {
  const { data: grants } = useGrants();
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    if (grants?.[grantType]) {
      const hasRestriction = grants[grantType].some(
        (grant: Grant) => grant.id === id && grant.permissions === grantLevel
      );
      setIsRestricted(hasRestriction);
    } else {
      setIsRestricted(false);
    }
  }, [grants, id, grantType, grantLevel]);

  return isRestricted;
};
