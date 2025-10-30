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
  FirewallAdmin,
  FirewallContributor,
  FirewallViewer,
  GrantType,
  ImageAdmin,
  ImageContributor,
  ImageViewer,
  LinodeAdmin,
  LinodeContributor,
  LinodeViewer,
  NodeBalancerAdmin,
  NodeBalancerContributor,
  NodeBalancerViewer,
  PermissionType,
  Profile,
  VolumeAdmin,
  VolumeContributor,
  VolumeViewer,
  VPCAdmin,
  VPCContributor,
  VPCViewer,
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

type EntityPermission =
  | FirewallAdmin
  | FirewallContributor
  | FirewallViewer
  | ImageAdmin
  | ImageContributor
  | ImageViewer
  | LinodeAdmin
  | LinodeContributor
  | LinodeViewer
  | NodeBalancerAdmin
  | NodeBalancerContributor
  | NodeBalancerViewer
  | VolumeAdmin
  | VolumeContributor
  | VolumeViewer
  | VPCAdmin
  | VPCContributor
  | VPCViewer;

declare const PermissionByAccessKnown: {
  account: Exclude<AccountAdmin, EntityPermission>;
  database: never; // TODO: add database permissions
  domain: never; // TODO: add domain permissions
  firewall: FirewallAdmin | FirewallContributor | FirewallViewer;
  image: ImageAdmin | ImageContributor | ImageViewer;
  linode: LinodeAdmin | LinodeContributor | LinodeViewer;
  lkecluster: never; // TODO: add lkecluster permissions
  longview: never; // TODO: add longview permissions
  nodebalancer:
    | NodeBalancerAdmin
    | NodeBalancerContributor
    | NodeBalancerViewer;
  placement_group: never; // TODO: add placement_group permissions
  stackscript: never; // TODO: add stackscript permissions
  volume: VolumeAdmin | VolumeContributor | VolumeViewer;
  vpc: VPCAdmin | VPCContributor | VPCViewer;
};

type AssertNever<T extends never> = T;

/**
 * Compile‑time assertions only.
 *
 * Ensure:
 * - PermissionByAccessKnown has only allowed AccessTypes.
 * - All AccessTypes are handled by PermissionByAccessKnown.
 */
export type NoExtraKeys = AssertNever<
  Exclude<keyof typeof PermissionByAccessKnown, AccessType>
>;
export type AllHandled = AssertNever<
  Exclude<AccessType, keyof typeof PermissionByAccessKnown>
>;

type KnownAccessKeys = keyof typeof PermissionByAccessKnown & AccessType;

type AllowedPermissionsFor<A extends AccessType> = A extends KnownAccessKeys
  ? (typeof PermissionByAccessKnown)[A]
  : // exhaustiveness check, no fallback
    never;

export type PermissionsResult<T extends readonly PermissionType[]> = {
  data: Record<T[number], boolean>;
} & Omit<UseQueryResult<PermissionType[], APIError[]>, 'data'>;

/**
 * Overload 1: account-level
 */
export function usePermissions<
  A extends 'account',
  T extends readonly AllowedPermissionsFor<A>[],
>(
  accessType: A,
  permissionsToCheck: T,
  entityId?: undefined,
  enabled?: boolean
): PermissionsResult<T>;

/**
 * Overload 2: entity-level
 */
export function usePermissions<
  A extends Exclude<AccessType, 'account'>,
  T extends readonly AllowedPermissionsFor<A>[],
>(
  accessType: A,
  permissionsToCheck: T,
  entityId: number | string | undefined,
  enabled?: boolean
): PermissionsResult<T>;

/**
 * Implementation
 */
export function usePermissions<
  A extends AccessType,
  T extends readonly PermissionType[],
>(
  accessType: A,
  permissionsToCheck: T,
  entityId?: number | string,
  enabled: boolean = true
): PermissionsResult<T> {
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
        permissionsToCheck.includes(
          blacklistedPermission as AllowedPermissionsFor<A>
        ) // some of the account admin in the blacklist have not been added yet
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUsePermissionMap = useBetaPermissions || useLAPermissions;

  const { data: grants, isLoading: isGrantsLoading } = useGrants(
    (!isIAMEnabled || !shouldUsePermissionMap) && enabled
  );

  const {
    data: userAccountPermissions,
    isLoading: isUserAccountPermissionsLoading,
    ...restAccountPermissions
  } = useUserAccountPermissions(
    shouldUsePermissionMap && accessType === 'account' && enabled
  );

  const {
    data: userEntityPermissions,
    isLoading: isUserEntityPermissionsLoading,
    ...restEntityPermissions
  } = useUserEntityPermissions(
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
        profile?.restricted,
        accessType
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
    isLoading: shouldUsePermissionMap
      ? isUserAccountPermissionsLoading || isUserEntityPermissionsLoading
      : isGrantsLoading,
    ...restAccountPermissions,
    ...restEntityPermissions,
  } as const;
}

export type EntityBase = Pick<AccountEntity, 'id' | 'label'>;

/**
 * Helper function to get the permissions for a list of entities.
 * Used only for restricted users who need to check permissions for each entity.
 *
 * ⚠️ This is a performance bottleneck for restricted users who have many entities.
 * It will need to be deprecated and refactored when we add the ability to filter entities by permission(s).
 */
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
      enabled: enabled && Boolean(profile?.restricted),
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
  const { isIAMBeta, isIAMEnabled } = useIsIAMEnabled();

  const accessType = entityType;

  /**
   * Apply the same Beta/LA permission logic as usePermissions.
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
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some((blacklistedPermission) =>
      permissionsToCheck.includes(blacklistedPermission as AccountAdmin)
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUsePermissionMap = useBetaPermissions || useLAPermissions;

  const { data: entityPermissions, isLoading: areEntityPermissionsLoading } =
    useEntitiesPermissions<T>(
      allEntities,
      entityType,
      profile,
      shouldUsePermissionMap && enabled
    );
  const { data: grants } = useGrants(
    (!isIAMEnabled || !shouldUsePermissionMap) && enabled
  );

  const entityPermissionsMap = shouldUsePermissionMap
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
      (permissions &&
        permissionsToCheck.every((permission) => permissions[permission]))
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
