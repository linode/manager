import type { MaintenancePolicySlug } from '@linode/api-v4';

export const MIGRATE_TOOLTIP_TEXT =
  'Migrates the Linode to a new host while it is still running. During the migration, the instance remains fully operational, though there is a temporary performance impact. For most maintenance events and Linode types, no reboot is required after the migration completes. If a reboot is required, it is automatically performed.';

export const POWER_OFF_TOOLTIP_TEXT =
  'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Depending on the maintenance event and Linode type, the Linode may or may not remain on the same host. Do not select this option for Linodes that are used for container orchestration solutions like Kubernetes.';

export const MAINTENANCE_POLICY_TITLE = 'Host Maintenance Policy';

export const MAINTENANCE_POLICY_DESCRIPTION =
  'Select the preferred host maintenance policy for this Linode. During host maintenance events (such as host upgrades), this policy setting helps determine which maintenance method is performed.';

export const MAINTENANCE_POLICY_ACCOUNT_DESCRIPTION =
  'Select the preferred default host maintenance policy for newly deployed Linodes. During host maintenance events (such as host upgrades), this policy setting determines the type of migration that is performed. This preference can be changed when creating new Linodes or modifying existing Linodes.';

export const MAINTENANCE_POLICY_OPTION_DESCRIPTIONS: Record<
  MaintenancePolicySlug,
  string
> = {
  'linode/migrate':
    'Migrates the Linode to a new host while it remains fully operational. Recommended for maximizing availability.',
  'linode/power_off_on':
    'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Recommended for maximizing performance.',
};

export const MAINTENANCE_POLICY_LEARN_MORE_URL =
  'https://techdocs.akamai.com/cloud-computing/docs/host-maintenance-policy';

export const MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT =
  'Maintenance policy is not available in the selected region.';

export const GPU_PLAN_NOTICE =
  'GPU plan does not support live migration and will perform a warm migration and then cold migration as fallbacks.';

export const UPCOMING_MAINTENANCE_NOTICE =
  'Changes to this policy will not affect this existing planned maintenance event and, instead, will be applied to future maintenance events scheduled after the change is made.';
