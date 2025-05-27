import type { FirewallDevice } from '@linode/api-v4/lib/firewalls';

export const device: FirewallDevice = {
  created: '2020-01-01',
  entity: {
    id: 16621754,
    label: 'Some Linode',
    type: 'linode' as any,
    url: 'v4/linode/instances/16621754',
    parentEntity: null,
  },
  id: 1,
  updated: '2020-01-01',
};

export const device2: FirewallDevice = {
  created: '2020-01-01',
  entity: {
    id: 15922741,
    label: 'Other Linode',
    type: 'linode' as any,
    url: 'v4/linode/instances/15922741',
    parentEntity: null,
  },
  id: 2,
  updated: '2020-01-01',
};

export const devices = [device, device2];
