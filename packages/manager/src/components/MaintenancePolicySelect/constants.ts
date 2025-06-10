import type { MaintenancePolicyId } from '@linode/api-v4';

export type MaintenancePolicyOption = {
  description: string;
  label: string;
  value: MaintenancePolicyId;
};

export const maintenancePolicyOptions: MaintenancePolicyOption[] = [
  {
    label: 'Migrate',
    value: 1,
    description:
      'Migrates the Linode to a new host while it remains fully operational. Recommended for maximizing availability.',
  },
  {
    label: 'Power Off / Power On',
    value: 2,
    description:
      'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Recommended for maximizing performance.',
  },
];

export const MIGRATE_TOOLTIP_TEXT =
  'Migrates the Linode to a new host while it is still running. During the migration, the instance remains fully operational, though there is a temporary performance impact. For most maintenance events and Linode types, no reboot is required after the migration completes. If a reboot is required, it is automatically performed.';

export const POWER_OFF_TOOLTIP_TEXT =
  'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Depending on the maintenance event and Linode type, the Linode may or may not remain on the same host. Do not select this option for Linodes that are used for container orchestration solutions like Kubernetes.';
