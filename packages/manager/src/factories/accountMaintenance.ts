import * as Factory from 'factory.ts';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { pickRandom } from 'src/utilities/random';

export const accountMaintenanceFactory = Factory.Sync.makeFactory<AccountMaintenance>(
  {
    type: 'cold_migration',
    status: Factory.each(() =>
      pickRandom(['pending', 'ready', 'started', 'completed'])
    ),
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
