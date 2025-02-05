import Factory from 'src/factories/factoryProxy';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

export const LinodeConfigInterfaceFactory = Factory.Sync.makeFactory<Interface>(
  {
    active: false,
    id: Factory.each((i) => i),
    ipam_address: '10.0.0.1/24',
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vlan',
  }
);

export const LinodeConfigInterfaceFactoryWithVPC = Factory.Sync.makeFactory<Interface>(
  {
    active: false,
    id: Factory.each((i) => i),
    ip_ranges: ['192.0.2.0/24', '192.0.3.0/24'],
    ipam_address: '10.0.0.1/24',
    ipv4: {
      nat_1_1: 'some nat',
      vpc: '10.0.0.0',
    },
    ipv6: {
      vpc: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    },
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vpc',
    subnet_id: Factory.each((i) => i),
    vpc_id: Factory.each((i) => i + 1),
  }
);
