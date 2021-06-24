import * as Factory from 'factory.ts';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { pickRandom, randomDate } from 'src/utilities/random';

export const accountMaintenanceFactory = Factory.Sync.makeFactory<AccountMaintenance>(
  {
    type: Factory.each(() =>
      pickRandom(['cold_migration', 'live_migration', 'reboot'])
    ),
    status: Factory.each(() =>
      pickRandom(['pending', 'ready', 'started', 'completed'])
    ),
    reason: Factory.each(() =>
      pickRandom([
        `This maintenance will allow us to update the BIOS on the host’s motherboard.`,
        `Your Linode's host has reached the end of its life cycle and will be retired.`,
        `We must apply a critical security update to your Linode's host.`,
        `To ensure that all customers have access to our latest products, your Linode(s) will need to be migrated to a host which has already been upgraded.`,
        `We must replace a switch upstream of your Linode's host.`,
        `We must upgrade the OS of your Linode's host.`,
        `We have detected an issue with the RAID card of your Linode's host.`,
        `There is an issue with the power supply of your Linode's host.`,
        `We must replace faulty RAM in your Linode's host.`,
      ])
    ),
    when: Factory.each(() => randomDate().toISOString()),
    entity: Factory.each((id) => ({
      label: `my-linode-${id}`,
      id,
      type: 'linode',
      url: '/v4/linode/instances/id',
    })),
  }
);
