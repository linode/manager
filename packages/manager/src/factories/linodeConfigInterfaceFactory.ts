import { Interface } from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

export const LinodeConfigInterfaceFactory = Factory.Sync.makeFactory<Interface>(
  {
    id: Factory.each((i) => i),
    ipam_address: '10.0.0.1/24',
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vlan',
  }
);
