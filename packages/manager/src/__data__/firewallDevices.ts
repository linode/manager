import { FirewallDevice } from '@linode/api-v4/lib/firewalls';

export const device: FirewallDevice = {
  id: 1,
  created: '2020-01-01',
  updated: '2020-01-01',
  entity: {
    id: 16621754,
    url: 'v4/linode/instances/16621754',
    type: 'linode' as any,
    label: 'Some Linode',
  },
};

export const device2: FirewallDevice = {
  id: 2,
  created: '2020-01-01',
  updated: '2020-01-01',
  entity: {
    id: 15922741,
    url: 'v4/linode/instances/15922741',
    type: 'linode' as any,
    label: 'Other Linode',
  },
};

export const devices = [device, device2];
