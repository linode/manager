import * as Factory from 'factory.ts';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';

const randomStatus = () => {
  const random = Math.floor(Math.random() * 4); // random will be 0, 1, 2, or 3

  switch (random) {
    case 0:
      return 'pending';
    case 1:
      return 'ready';
    case 2:
      return 'started';
    case 3:
      return 'completed';
    default:
      return 'pending';
  }
};

export const accountMaintenanceFactory = Factory.Sync.makeFactory<AccountMaintenance>(
  {
    type: 'cold_migration',
    status: Factory.each(() => randomStatus()),
    reason: 'Some reason for maintenance.',
    when: '2025-01-01T00:00:00',
    entity: Factory.each((id) => ({
      label: `my-linode-${id}`,
      id,
      type: 'linode',
      url: '/v4/linode/instances/id',
    })),
  }
);
