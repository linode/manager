import { FirewallDevice } from 'linode-js-sdk/lib/firewalls';

export const device: FirewallDevice = {
  id: 1,
  entity: {
    id: 16621754,
    url: 'v4/linode/instances/16621754',
    type: 'linode' as any,
    label: 'Some Linode'
  }
};

export const device2: FirewallDevice = {
  id: 2,
  entity: {
    id: 15922741,
    url: 'v4/linode/instances/15922741',
    type: 'linode' as any,
    label: 'Other Linode'
  }
};

export const devices = [device, device2];
