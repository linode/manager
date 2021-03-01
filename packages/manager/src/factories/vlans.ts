import { VLAN } from '@linode/api-v4/lib/vlans/types';
import * as Factory from 'factory.ts';

export const VLANFactory = Factory.Sync.makeFactory<VLAN>({
  id: Factory.each((i) => i),
  description: Factory.each((i) => `vlan-${i}`),
  region: 'us-east',
  linodes: [
    { id: 0, ipv4_address: '10.0.0.1', mac_address: 'a4:ac:39:b7:6e:42' },
    { id: 1, ipv4_address: '10.0.0.2', mac_address: 'a4:ac:39:b7:6e:43' },
    { id: 2, ipv4_address: '10.0.0.3', mac_address: 'a4:ac:39:b7:6e:44' },
  ],
  cidr_block: '10.0.0.0/24',
  created: '2020-10-01T00:00:00',
});
