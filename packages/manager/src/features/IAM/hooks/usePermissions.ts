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

import { fromGrants, toEntityPermissionMap, toPermissionMap } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type {
  AccountEntity,
  APIError,
  EntityType,
  Filter,
  Grants,
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
  // return useQueries({
  //   queries: (entities || []).map((entity: T) => ({
  //     queryKey: [entityType, entity.id],
  //     queryFn: () =>
  //       getUserEntityPermissions(
  //         profile?.username || '',
  //         entityType,
  //         entity.id
  //       ),
  //     enabled,
  //   })),
  // });

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

  const entityPermissionsMap = toEntityPermissionMap(
    allEntities,
    entityPermissions
  );

  console.log('entityPermissionsMap', entityPermissionsMap);

  const { data: grants } = useGrants(!isIAMEnabled);

  // const entities: T[] | undefined = isIAMEnabled
  //   ? filterByEntityPermissions<T>(
  //       allEntities,
  //       entityPermissions,
  //       permissionsToCheck
  //     )
  //   : filterByGrants<T>(
  //       allEntities,
  //       entityType,
  //       permissionsToCheck,
  //       grants,
  //       profile
  //     );

  return {
    data: [],
    hasFiltered: false
  } as const;
};

export const filterByEntityPermissions = <T extends EntityBase>(
  allEntities: T[] | undefined,
  entityPermissions: { data?: PermissionType[] }[],
  permissionsToCheck: PermissionType[]
): T[] | undefined => {
  return allEntities?.filter((_entity: T, index: number) => {
    const permissions = entityPermissions[index]?.data;
    return permissionsToCheck.every((permission) =>
      permissions?.includes(permission)
    );
  });
};

export const filterByGrants = <T extends EntityBase>(
  allEntities: T[] | undefined,
  entityType: EntityType,
  permissionsToCheck: PermissionType[],
  grants?: Grants,
  profile?: Profile
): T[] | undefined => {
  return allEntities?.filter((entity: T) => {
    const permissionMap = fromGrants(
      entityType,
      permissionsToCheck,
      grants,
      profile?.restricted,
      entity.id
    );
    return permissionsToCheck.every((permission) => permissionMap[permission]);
  });
};
