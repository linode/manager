import { Factory } from './factoryProxy';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

export const linodeConfigInterfaceFactory = Factory.Sync.makeFactory<Interface>(
  {
    active: false,
    id: Factory.each((i) => i),
    ipam_address: '10.0.0.1/24',
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vlan',
  },
);

export const linodeConfigInterfaceFactoryWithVPC =
  Factory.Sync.makeFactory<Interface>({
    active: false,
    id: Factory.each((i) => i),
    ip_ranges: ['192.0.2.0/24', '192.0.3.0/24'],
    ipam_address: null,
    ipv4: {
      nat_1_1: 'some nat',
      vpc: '10.0.0.0',
    },
    ipv6: {
      is_public: false,
      ranges: [
        {
          range: '2001:db8::/64',
        },
      ],
      slaac: [
        {
          address: '2001:db8::1',
          range: '2001:db8::/64',
        },
      ],
    },
    label: Factory.each((i) => `interface-${i}`),
    purpose: 'vpc',
    subnet_id: Factory.each((i) => i),
    vpc_id: Factory.each((i) => i + 1),
  });
