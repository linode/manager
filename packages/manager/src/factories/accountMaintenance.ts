import * as Factory from 'factory.ts';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { pickRandom, randomDate } from 'src/utilities/random';

export const accountMaintenanceFactory = Factory.Sync.makeFactory<AccountMaintenance>(
  {
    type: Factory.each(() => pickRandom(['cold_migration', 'reboot'])),
    status: Factory.each(() =>
      pickRandom(['pending', 'ready', 'started', 'completed'])
    ),
    reason: 'Some reason for maintenance.',
    when: Factory.each(() => randomDate().toISOString()),
    entity: Factory.each((id) => ({
      label: `my-linode-${id}`,
      id,
      type: 'linode',
      url: '/v4/linode/instances/id',
    })),
  }
);
