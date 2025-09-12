import { getUserEntityPermissions } from '@linode/api-v4';
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
  AccessType,
  AccountAdmin,
  AccountEntity,
  APIError,
  EntityType,
  GrantType,
  PermissionType,
  Profile,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

const BETA_ACCESS_TYPE_SCOPE: AccessType[] = ['account', 'linode', 'firewall'];
const LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE = [
  'create_image',
  'upload_image',
  'create_vpc',
  'create_volume',
  'create_nodebalancer',
];

export type PermissionsResult<T extends readonly PermissionType[]> = {
  data: Record<T[number], boolean>;
} & Omit<UseQueryResult<PermissionType[], APIError[]>, 'data'>;

export const usePermissions = <T extends readonly PermissionType[]>(
  accessType: AccessType,
  permissionsToCheck: T,
  entityId?: number | string,
  enabled: boolean = true
): PermissionsResult<T> => {
  const { isIAMBeta, isIAMEnabled } = useIsIAMEnabled();
  const { data: profile } = useProfile();

  const _entityId =
    typeof entityId === 'string' && entityId.includes('/')
      ? entityId.split('/')[1]
      : entityId;

  /**
   * BETA and LA features should use the new permission model.
   * However, beta features are limited to a subset of AccessTypes and account permissions.
   * - Use Beta Permissions if:
   *   - The feature is beta
   *   - The access type is in the BETA_ACCESS_TYPE_SCOPE
   *   - The account permission is not in the LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE
   * - Use LA Permissions if:
   *   - The feature is not beta
   */
  const useBetaPermissions =
    isIAMEnabled &&
    isIAMBeta &&
    BETA_ACCESS_TYPE_SCOPE.includes(accessType) &&
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some(
      (blacklistedPermission) =>
        permissionsToCheck.includes(blacklistedPermission as AccountAdmin) // some of the account admin in the blacklist have not been added yet
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUsePermissionMap = useBetaPermissions || useLAPermissions;

  const { data: grants } = useGrants(
    (!isIAMEnabled || !shouldUsePermissionMap) && enabled
  );

  const { data: userAccountPermissions, ...restAccountPermissions } =
    useUserAccountPermissions(
      shouldUsePermissionMap && accessType === 'account' && enabled
    );

  const { data: userEntityPermissions, ...restEntityPermissions } =
    useUserEntityPermissions(
      accessType,
      _entityId!,
      shouldUsePermissionMap && enabled
    );

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermissions;

  const permissionMap = shouldUsePermissionMap
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
        _entityId
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
  permissionsToCheck: PermissionType[],
  enabled?: boolean
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
    useEntitiesPermissions<T>(
      allEntities,
      entityType,
      profile,
      isIAMEnabled && enabled
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
    const permissions = entityPermissionsMap[entity.id] ?? {};
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
