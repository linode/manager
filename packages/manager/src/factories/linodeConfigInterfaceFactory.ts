import * as Factory from 'factory.ts';
import { Interface } from '@linode/api-v4/lib/linodes/types';

export const LinodeConfigInterfaceFactory = Factory.Sync.makeFactory<Interface>(
  {
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vlan',
    ipam_address: '10.0.0.1/24',
  }
);
