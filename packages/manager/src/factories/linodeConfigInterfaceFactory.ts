import { Interface } from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

export const LinodeConfigInterfaceFactory = Factory.Sync.makeFactory<Interface>(
  {
    active: true,
    id: Factory.each((i) => i),
    ipam_address: '10.0.0.1/24',
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vlan',
  }
);

export const LinodeConfigInterfaceFactoryWithVPC = Factory.Sync.makeFactory<Interface>(
  {
    id: Factory.each((i) => i),
    ipam_address: '10.0.0.1/24',
    label: Factory.each((i) => `interface-${i}`),
    active: true,
    purpose: 'vpc',
    ipv4: {
      vpc: '10.0.0.0',
      nat_1_1: 'some nat',
    },
    ipv6: {
      vpc: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    },
    ip_ranges: ['192.0.2.0/24'],
    vpc_id: Factory.each((i) => i + 1),
    subnet_id: Factory.each((i) => i),
  }
);
