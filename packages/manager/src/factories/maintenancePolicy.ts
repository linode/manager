import { Factory } from '@linode/utilities';

import type { MaintenancePolicy } from '@linode/api-v4';

export const maintenancePolicyFactory =
  Factory.Sync.makeFactory<MaintenancePolicy>({
    id: Factory.each((id) => (id === 1 ? 1 : 2) as 1 | 2),
    name: Factory.each((id) => (id === 1 ? 'Migrate' : 'Power Off / Power On')),
    description: Factory.each((id) =>
      id === 1
        ? 'Set the preferred host maintenance policy for this Linode. During host maintenance events (such as host upgrades), this policy setting helps determine which maintenance method is performed.'
        : 'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Recommended for maximizing performance.'
    ),
    is_default: Factory.each((id) => id === 1),
    notification_period_sec: 86400,
    type: Factory.each((id) => (id === 1 ? 'migrate' : 'power on/off')),
  });
