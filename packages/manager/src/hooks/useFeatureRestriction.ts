import { useEffect, useState } from 'react';

import { useGrants } from 'src/queries/profile';

import type { Grant, GrantLevel, GrantType, Grants } from '@linode/api-v4';

export const useFeatureRestriction = ({
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
