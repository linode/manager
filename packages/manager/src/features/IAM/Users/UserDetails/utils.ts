import type { Status } from '../../Shared/StatusIcon/StatusIcon';
import type { IamUserRoles } from '@linode/api-v4';

export interface TfaStatusResult {
  iconStatus: Status;
  label: string;
}

/**
 * Returns the display label and icon status for a user's two-factor authentication (2FA) state.
 *
 * When account-wide 2FA enforcement is enabled:
 *
 * - `tfa_enabled = true`,  `tfa_enforced = true`
 *   → **Enforced, active**
 *
 * - `tfa_enabled = false`, `tfa_enforced = true`
 *   → **Enforced, awaiting user configuration**
 *
 * - `tfa_enabled = true`,  `tfa_enforced = false`
 *   → **Active**
 *
 * - `tfa_enabled = false`, `tfa_enforced = false`
 *   → **Inactive**
 *
 * When account-wide enforcement is disabled, the function falls back to the
 * legacy **Enabled** / **Disabled** labels.
 */
export const getTfaStatus = (
  tfaEnabled: boolean,
  tfaEnforced: boolean,
  // TODO: UIE-12191 - Remove `isEnforcementEnabled` parameter once 2FA enforcement is fully released.
  isEnforcementEnabled: boolean
): TfaStatusResult => {
  if (!isEnforcementEnabled) {
    return {
      iconStatus: tfaEnabled ? 'active' : 'inactive',
      label: tfaEnabled ? 'Enabled' : 'Disabled',
    };
  }
  if (tfaEnabled && tfaEnforced) {
    return { iconStatus: 'active', label: 'Enforced, active' };
  }
  if (!tfaEnabled && tfaEnforced) {
    return {
      iconStatus: 'other',
      label: 'Enforced, awaiting user configuration',
    };
  }
  if (tfaEnabled && !tfaEnforced) {
    return { iconStatus: 'active', label: 'Active' };
  }
  return { iconStatus: 'inactive', label: 'Inactive' };
};

/* Calculates the total number of unique roles assigned to a user. */
export const getTotalAssignedRoles = (assignedRoles: IamUserRoles): number => {
  const accountAccessRoles = assignedRoles.account_access || [];

  const entityAccessRoles =
    assignedRoles.entity_access?.flatMap((entity) => entity.roles || []) ?? [];

  const combinedRoles = Array.from(
    new Set([...accountAccessRoles, ...entityAccessRoles])
  );

  return combinedRoles.length;
};
