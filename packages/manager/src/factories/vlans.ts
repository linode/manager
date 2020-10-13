import { VLAN } from '@linode/api-v4/lib/vlans/types';
import * as Factory from 'factory.ts';

export const VLANFactory = Factory.Sync.makeFactory<VLAN>({
  id: Factory.each(i => i),
  description: Factory.each(i => `vlan-${i}`),
  region: 'us-east',
  linodes: [
    { id: 0, ip: '10.0.0.1' },
    { id: 1, ip: '10.0.0.2' },
    { id: 2, ip: '10.0.0.3' }
  ],
  cidr_block: '10.0.0.0/24',
  created: '2020-10-01 00:00:00'
});
