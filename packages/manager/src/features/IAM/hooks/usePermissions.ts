import {
  type AccessType,
  getUserEntityPermissions,
  type PermissionType,
} from '@linode/api-v4';
import {
  useGrants,
  useProfile,
  useQueries,
  useUserAccountPermissions,
  useUserEntityPermissions,
} from '@linode/queries';

import {
  entityPermissionMapFrom,
  fromGrants,
  toEntityPermissionMap,
  toPermissionMap,
} from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type {
  AccountEntity,
  APIError,
  EntityType,
  Filter,
  GrantType,
  Params,
  Profile,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

export const usePermissions = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  entityId?: number,
  enabled: boolean = true
): { permissions: Record<PermissionType, boolean> } => {
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: userAccountPermissions } = useUserAccountPermissions(
    isIAMEnabled && accessType === 'account' && enabled
  );

  const { data: userEntityPermisssions } = useUserEntityPermissions(
    accessType,
    entityId!,
    isIAMEnabled && enabled
  );

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermisssions;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants(!isIAMEnabled && enabled);

  const permissionMap = isIAMEnabled
    ? toPermissionMap(
        permissionsToCheck,
        usersPermissions!,
        profile?.restricted
      )
    : fromGrants(
        accessType,
        permissionsToCheck,
        grants!,
        profile?.restricted,
        entityId
      );

  return { permissions: permissionMap } as const;
};

export type EntityBase = Pick<AccountEntity, 'id' | 'label'>;

export const useEntitiesPermissions = <T extends EntityBase>(
  entities: T[] | undefined,
  entityType: EntityType,
  profile?: Profile,
  enabled = true
) => {
  const queries = useQueries({
    queries: (entities || []).map((entity: T) => ({
      queryKey: [entityType, entity.id],
      queryFn: () =>
        getUserEntityPermissions(
          profile?.username || '',
          entityType,
          entity.id
        ),
      enabled,
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const data = queries.map((query) => query.data);

  return { data, isLoading, isError };
};

export const useQueryWithPermissions = <T extends EntityBase>(
  query: (
    params?: Params,
    filter?: Filter,
    enabled?: boolean
  ) => UseQueryResult<T[], APIError[]>,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
): { data: T[]; hasFiltered: boolean } => {
  const { data: allEntities } = query();
  const { data: profile } = useProfile();
  const { isIAMEnabled } = useIsIAMEnabled();
  const { data: entityPermissions } = useEntitiesPermissions<T>(
    allEntities,
    entityType,
    profile,
    isIAMEnabled
  );
  const { data: grants } = useGrants(!isIAMEnabled);

  const entityPermissionsMap = isIAMEnabled
    ? toEntityPermissionMap(
        allEntities,
        entityPermissions,
        permissionsToCheck,
        profile?.restricted
      )
    : entityPermissionMapFrom(grants, entityType as GrantType, profile);

  const entities: T[] | undefined = allEntities?.filter((entity: T) => {
    const permissions = entityPermissionsMap[entity.id];
    return permissionsToCheck.every((permission) => permissions[permission]);
  });

  return {
    data: entities || [],
    hasFiltered: allEntities?.length !== entities?.length,
  } as const;
};
