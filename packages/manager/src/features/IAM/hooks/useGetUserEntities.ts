import { iamQueries, useQueries } from '@linode/queries';
import * as React from 'react';

import type { IamUserRoles } from '@linode/api-v4';

interface UseGetUserEntitiesProps {
  username: string;
  userRoles: IamUserRoles | undefined;
}

/**
 * This hook gets all entities a user has the lowest level of access to.
 *
 * In order to get all entities for an account, use the useAllAccountEntities hook.
 */
export const useGetUserEntities = (props: UseGetUserEntitiesProps) => {
  const { userRoles, username } = props;

  /**
   * Get the types of entities the user has access to by mapping over the user roles.
   * This is used to determine which entity types to query for.
   */
  const entityTypes = React.useMemo(() => {
    return userRoles?.entity_access?.map((entity) => entity.type) ?? [];
  }, [userRoles]);

  /**
   * Get the entities for each entity type via /iam/users/${username}/entities/${entityType}
   * While this endpoint can be filtered by permission, omitting the permission parameter will return all entities the user has any access to, starting at the lowest level of access (view_{entity_type}).
   */
  const entityQueries = useQueries({
    queries: entityTypes.map((type) => ({
      ...iamQueries.user(username ?? '')._ctx.allUserEntities(type),
      enabled: !!username,
      // Because entities can be added or removed from the account at any time, and we don't invalidate the query when this happens,
      // we need to set a short stale time to ensure the data is up to date.
      staleTime: 1 * 60 * 1000, // 1 minute stale time
    })),
  });

  /**
   * Combine the entities from each entity type into a single array.
   */
  const { entities, isLoading, error } = React.useMemo(() => {
    const isLoading = entityQueries.some((q) => q.isLoading);
    const error = entityQueries.some((q) => q.error);

    if (isLoading) {
      return { entities: undefined, isLoading: true };
    }

    const entities = entityQueries.map((q) => q.data || []).flat();

    return { entities, error, isLoading: false };
  }, [entityQueries]);

  return { userEntities: entities, isLoading, error };
};
