import { useIsLkeIAMEnabled } from './useIsLkeIAMEnabled';
import { usePermissions } from './usePermissions';

import type { PermissionsResult } from './usePermissions';
import type {
  AccountLkeClusterCreator,
  LkeClusterAdmin,
  LkeClusterContributor,
  LkeClusterViewer,
} from '@linode/api-v4';

type LkeAccountPermission = AccountLkeClusterCreator;
type LkeEntityPermission =
  | LkeClusterAdmin
  | LkeClusterContributor
  | LkeClusterViewer;

/**
 * `usePermissions` for LKE, gated by `iamLKE`.
 *
 * LKE permission types are only exposed here so callers cannot bypass the flag
 * via `usePermissions`.
 *
 * When the flag is on, uses the IAM API. When it is off, uses the grants
 * fallback already in `usePermissions`.
 */
export function useLkePermissions<T extends readonly LkeAccountPermission[]>(
  accessType: 'account',
  permissionsToCheck: T,
  entityId?: undefined,
  enabled?: boolean
): PermissionsResult<T>;

export function useLkePermissions<T extends readonly LkeEntityPermission[]>(
  accessType: 'lkecluster',
  permissionsToCheck: T,
  entityId: number | string | undefined,
  enabled?: boolean
): PermissionsResult<T>;

export function useLkePermissions<
  T extends readonly (LkeAccountPermission | LkeEntityPermission)[],
>(
  accessType: 'account' | 'lkecluster',
  permissionsToCheck: T,
  entityId?: number | string,
  enabled: boolean = true
): PermissionsResult<T> {
  const { isLkeIAMEnabled } = useIsLkeIAMEnabled();

  return (
    usePermissions as (
      accessType: 'account' | 'lkecluster',
      permissionsToCheck: T,
      entityId: number | string | undefined,
      enabled?: boolean,
      useIamApi?: boolean
    ) => PermissionsResult<T>
  )(accessType, permissionsToCheck, entityId, enabled, isLkeIAMEnabled);
}
