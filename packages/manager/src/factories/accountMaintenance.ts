import { pickRandom, randomDate } from '@linode/utilities';
import { Factory } from '@linode/utilities';

import type { AccountMaintenance } from '@linode/api-v4/lib/account/types';

export const accountMaintenanceFactory = Factory.Sync.makeFactory<AccountMaintenance>(
  {
    entity: Factory.each((id) =>
      pickRandom([
        {
          id,
          label: `linode-${id}`,
          type: 'linode',
          url: `/v4/linode/instances/${id}`,
        },
        {
          id,
          label: `volume-${id}`,
          type: 'volume',
          url: `/v4/volume/${id}`,
        },
      ])
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
    status: Factory.each(() => pickRandom(['pending', 'started'])),
    type: Factory.each(() =>
      pickRandom(['cold_migration', 'live_migration', 'reboot'])
    ),
    when: Factory.each(() => randomDate().toISOString()),
  }
);
