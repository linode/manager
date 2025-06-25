import type { MaintenancePolicy } from '@linode/api-v4';

/**
 * Maintenance policy name begin with "Default " for some reason.
 * We'll use this function to remove that.
 */
export function getPolicyLabel(policy: MaintenancePolicy) {
  return policy.name.replace('Default ', '');
}
