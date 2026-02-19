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
  const { isIAMEnabled } = useIsIAMEnabled();
  const { data: profile } = useProfile();

  const _entityId =
    typeof entityId === 'string' && entityId.includes('/')
      ? entityId.split('/')[1]
      : entityId;

  const { data: grants, isLoading: isGrantsLoading } = useGrants(
    !isIAMEnabled && enabled
  );

  const {
    data: userAccountPermissions,
    isLoading: isUserAccountPermissionsLoading,
    ...restAccountPermissions
  } = useUserAccountPermissions(
    isIAMEnabled && accessType === 'account' && enabled
  );

  const {
    data: userEntityPermissions,
    isLoading: isUserEntityPermissionsLoading,
    ...restEntityPermissions
  } = useUserEntityPermissions(accessType, _entityId!, isIAMEnabled && enabled);

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermissions;

  const permissionMap = isIAMEnabled
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
    isLoading: isIAMEnabled
      ? isUserAccountPermissionsLoading || isUserEntityPermissionsLoading
      : isGrantsLoading,
    ...restAccountPermissions,
    ...restEntityPermissions,
  } as const;
}
