import {
  useGetUserEntitiesByPermissionQuery,
  useGrants,
} from '@linode/queries';

import { entityPermissionMapFrom } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';
import {
  BETA_ACCESS_TYPE_SCOPE,
  LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE,
} from './usePermissions';

import type { EntityPermissionMap } from './adapters/permissionAdapters';
import type {
  APIError,
  EntityType,
  Firewall,
  GrantType,
  Image,
  Linode,
  NodeBalancer,
  PermissionType,
  Volume,
  VPC,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

type FullEntityType = Firewall | Image | Linode | NodeBalancer | Volume | VPC;

interface UseGetEntitiesByPermissionProps<T extends FullEntityType> {
  enabled?: boolean;
  entityType: EntityType;
  permission: PermissionType;
  query: UseQueryResult<T[] | undefined, APIError[]>;
  username: string | undefined;
}

export const useGetUserEntitiesByPermission = <T extends FullEntityType>({
  query,
  entityType,
  permission,
  username,
  enabled = true,
}: UseGetEntitiesByPermissionProps<T>) => {
  /**
   * Get the full entities from the API
   */
  const {
    data: allEntities,
    error: isAllEntitiesError,
    isLoading: isAllEntitiesLoading,
    ...restQueryResult
  } = query;
  const { isIAMBeta, isIAMEnabled, profile } = useIsIAMEnabled();

  /**
   * Get the entities by permission from the API
   * This returns entities IDs which we need to map against the allEntities query
   */
  const {
    data: entitiesByPermission,
    isLoading: isEntitiesByPermissionLoading,
    error: isEntitiesByPermissionError,
  } = useGetUserEntitiesByPermissionQuery({
    entityType,
    permission,
    username,
  });

  /**
   * Beta/LA permission logic
   * Will be cleaned up as soon as LA is fully adopted
   */
  const useBetaPermissions =
    isIAMEnabled &&
    isIAMBeta &&
    BETA_ACCESS_TYPE_SCOPE.includes(entityType) &&
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some((blacklistedPermission) =>
      permission.includes(blacklistedPermission)
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUseIAMPermissions = useBetaPermissions || useLAPermissions;

  /**
   * Legacy Grants - only used for restricted users if IAM is disabled
   */
  const { data: grants } = useGrants(
    (!isIAMEnabled || !shouldUseIAMPermissions) && enabled
  );
  let entityPermissionsMap: EntityPermissionMap = {};
  if (profile?.restricted) {
    entityPermissionsMap = entityPermissionMapFrom(
      grants,
      entityType as GrantType,
      profile
    );
  }

  /**
   * Map the entities by permission to the full entities
   */
  const fullEntitiesFromEntitiesByPermission = entitiesByPermission?.map(
    (entity) => allEntities?.find((e) => e.id === entity.id)
  );

  /**
   * Build the entities list based on the user types (restricted or unrestricted) and the beta/LA permission logic
   */
  const _availableEntities = shouldUseIAMPermissions
    ? profile?.restricted
      ? fullEntitiesFromEntitiesByPermission
      : allEntities
    : profile?.restricted
      ? allEntities?.filter(
          (entity: T) =>
            entityPermissionsMap[entity.id] &&
            entityPermissionsMap[entity.id][permission]
        )
      : allEntities;

  const isLoading = isAllEntitiesLoading || isEntitiesByPermissionLoading;
  const error = isAllEntitiesError || isEntitiesByPermissionError;

  return {
    data: _availableEntities,
    isLoading,
    error,
    ...restQueryResult,
  };
};
