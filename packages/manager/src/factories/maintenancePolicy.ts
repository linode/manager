import { Factory } from '@linode/utilities';

import type { MaintenancePolicy } from '@linode/api-v4';

export const maintenancePolicyFactory =
  Factory.Sync.makeFactory<MaintenancePolicy>({
    id: Factory.each((id) => id),
    name: 'Power Off / Power On',
    description: 'This is a maintenance policy description.',
    is_default: false,
    notification_period_sec: 86400,
    type: 'power-off/on',
  });
