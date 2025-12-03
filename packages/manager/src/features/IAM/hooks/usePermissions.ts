import {
  useGrants,
  useProfile,
  useUserAccountPermissions,
  useUserEntityPermissions,
} from '@linode/queries';

import { fromGrants, toPermissionMap } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type {
  AccessType,
  AccountAdmin,
  APIError,
  FirewallAdmin,
  FirewallContributor,
  FirewallViewer,
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
  VolumeAdmin,
  VolumeContributor,
  VolumeViewer,
  VPCAdmin,
  VPCContributor,
  VPCViewer,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

export const BETA_ACCESS_TYPE_SCOPE: AccessType[] = [
  'account',
  'linode',
  'firewall',
];
export const LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE = [
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
        Array.isArray(usersPermissions) ? usersPermissions : [],
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
