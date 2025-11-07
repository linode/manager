import {
  useGetUserEntitiesByPermissionQuery,
  useGrants,
} from '@linode/queries';

import { fromGrants } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';
import {
  BETA_ACCESS_TYPE_SCOPE,
  LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE,
} from './usePermissions';

import type {
  AccountEntity,
  APIError,
  EntityType,
  PermissionType,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

interface UseGetEntitiesByPermissionProps<T extends AccountEntity> {
  enabled?: boolean;
  entityType: EntityType;
  permission: PermissionType;
  useQueryResult: UseQueryResult<T[], APIError[]>;
  username: string;
}

export const useGetEntitiesByPermission = <T extends AccountEntity>({
  useQueryResult,
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
  } = useQueryResult;
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

  const fullEntitiesFromEntitiesByPermission = entitiesByPermission?.map(
    (entity) => {
      return {
        ...allEntities?.find((e) => e.id === entity.id),
      };
    }
  );

  const _availableEntities = shouldUseIAMPermissions
    ? profile?.restricted
      ? fullEntitiesFromEntitiesByPermission
      : allEntities
    : fromGrants(entityType, [permission], grants, profile?.restricted);

  const isLoading = isAllEntitiesLoading || isEntitiesByPermissionLoading;
  const error = isAllEntitiesError || isEntitiesByPermissionError;

  return {
    data: _availableEntities,
    isLoading,
    error,
    ...restQueryResult,
  };
};
