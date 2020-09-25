import { VLAN } from '@linode/api-v4/lib/vlans/types';
import * as Factory from 'factory.ts';

export const VLANFactory = Factory.Sync.makeFactory<VLAN>({
  id: Factory.each(i => i),
  description: Factory.each(i => `vlan-${i}`),
  region: 'us-east',
  // TODO mock linodes
  linodes: [],
  cidr_block: 'eth1'
});
