import { Factory } from '@linode/utilities';

import {
  MIGRATE_OPTION,
  POWER_OFF_OPTION,
} from '../components/MaintenancePolicySelect/constants';

import type { MaintenancePolicy } from '@linode/api-v4';

export const maintenancePolicyFactory =
  Factory.Sync.makeFactory<MaintenancePolicy>({
    id: Factory.each((id) => (id === 1 ? 1 : 2) as 1 | 2),
    name: Factory.each((id) => (id === 1 ? 'Migrate' : 'Power Off / Power On')),
    description: Factory.each((id) =>
      id === 1 ? MIGRATE_OPTION : POWER_OFF_OPTION
    ),
    is_default: Factory.each((id) => id === 1),
    notification_period_sec: 86400,
    type: Factory.each((id) => (id === 1 ? 'migrate' : 'power on/off')),
  });
