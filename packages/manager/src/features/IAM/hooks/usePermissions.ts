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
  GrantType,
  Profile,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

export type PermissionsResult = {
  data: Record<PermissionType, boolean>;
} & Omit<UseQueryResult<PermissionType[], APIError[]>, 'data'>;

export const usePermissions = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  entityId?: number,
  enabled: boolean = true
): PermissionsResult => {
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: userAccountPermissions, ...restAccountPermissions } =
    useUserAccountPermissions(
      isIAMEnabled && accessType === 'account' && enabled
    );

  const { data: userEntityPermisssions, ...restEntityPermissions } =
    useUserEntityPermissions(accessType, entityId!, isIAMEnabled && enabled);

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

  return {
    data: permissionMap,
    ...restAccountPermissions,
    ...restEntityPermissions,
  } as const;
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

  const data = queries.map((query) => query.data);
  const error = queries.map((query) => query.error);
  const isError = queries.some((query) => query.isError);
  const isLoading = queries.some((query) => query.isLoading);

  return { data, error, isError, isLoading };
};

export type QueryWithPermissionsResult<T> = {
  data: T[];
  error: APIError[] | null;
  hasFiltered: boolean;
  isError: boolean;
  isLoading: boolean;
} & Omit<
  UseQueryResult<T[], APIError[]>,
  'data' | 'error' | 'isError' | 'isLoading'
>;

export const useQueryWithPermissions = <T extends EntityBase>(
  useQueryResult: UseQueryResult<T[], APIError[]>,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
): QueryWithPermissionsResult<T> => {
  const {
    data: allEntities,
    error: allEntitiesError,
    isLoading: areEntitiesLoading,
    isError: isEntitiesError,
    ...restQueryResult
  } = useQueryResult;
  const { data: profile } = useProfile();
  const { isIAMEnabled } = useIsIAMEnabled();
  const { data: entityPermissions, isLoading: areEntityPermissionsLoading } =
    useEntitiesPermissions<T>(allEntities, entityType, profile, isIAMEnabled);
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
    return (
      !profile?.restricted ||
      permissionsToCheck.every((permission) => permissions[permission])
    );
  });

  return {
    data: entities || [],
    error: allEntitiesError,
    hasFiltered: allEntities?.length !== entities?.length,
    isError: isEntitiesError,
    isLoading: areEntitiesLoading || areEntityPermissionsLoading,
    ...restQueryResult,
  } as const;
};
