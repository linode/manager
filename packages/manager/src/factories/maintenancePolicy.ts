import { Factory } from '@linode/utilities';

import type { MaintenancePolicy } from '@linode/api-v4';

export const maintenancePolicyFactory =
  Factory.Sync.makeFactory<MaintenancePolicy>({
    slug: Factory.each((id) =>
      id === 1 ? 'linode/migrate' : 'linode/power_off_on'
    ),
    label: 'Power Off / Power On',
    description: 'This is a maintenance policy description.',
    is_default: false,
    notification_period_sec: 86400,
    type: 'linode_power_off_on',
  });
