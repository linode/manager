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
  const {
    data: allEntities,
    error: isAllEntitiesError,
    isLoading: isAllEntitiesLoading,
    ...restQueryResult
  } = query;
  const { isIAMBeta, isIAMEnabled, profile } = useIsIAMEnabled();

  const {
    data: entitiesByPermission,
    isLoading: isEntitiesByPermissionLoading,
    error: isEntitiesByPermissionError,
  } = useGetUserEntitiesByPermissionQuery({
    entityType,
    permission,
    username,
  });

  const useBetaPermissions =
    isIAMEnabled &&
    isIAMBeta &&
    BETA_ACCESS_TYPE_SCOPE.includes(entityType) &&
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some((blacklistedPermission) =>
      permission.includes(blacklistedPermission)
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUseIAMPermissions = useBetaPermissions || useLAPermissions;

  const { data: grants } = useGrants(
    (!isIAMEnabled || !shouldUseIAMPermissions) && enabled
  );

  const fullEntitiesFromEntitiesByPermission = entitiesByPermission
    ?.map((entity) => allEntities?.find((e) => e.id === entity.id))
    .filter((e): e is T => e !== undefined);

  let entityPermissionsMap: EntityPermissionMap = {};
  if (profile?.restricted) {
    entityPermissionsMap = entityPermissionMapFrom(
      grants,
      entityType as GrantType,
      profile
    );
  }

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
