// Factories for the new Linode Interfaces type

import Factory from 'src/factories/factoryProxy';

import type { LinodeInterface } from '@linode/api-v4';

export const linodeInterfaceFactoryVlan = Factory.Sync.makeFactory<LinodeInterface>(
  {
    created: '2020-01-01 00:00:00',
    default_route: {
      ipv4: true,
    },
    id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    public: null,
    updated: '2020-01-01 00:00:00',
    version: 1,
    vlan: {
      ipam_address: '192.168.0.1',
      vlan_label: 'vlan-interface',
    },
    vpc: null,
  }
);

export const linodeInterfaceFactoryVPC = Factory.Sync.makeFactory<LinodeInterface>(
  {
    created: '2020-01-01 00:00:00',
    default_route: {
      ipv4: true,
    },
    id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    public: null,
    updated: '2020-01-01 00:00:00',
    version: 1,
    vlan: null,
    vpc: {
      ipv4: {
        addresses: [
          {
            address: '10.0.0.0',
            primary: true,
          },
        ],
        ranges: [],
      },
      subnet_id: 1,
      vpc_id: 1,
    },
  }
);

export const linodeInterfaceFactoryPublic = Factory.Sync.makeFactory<LinodeInterface>(
  {
    created: '2020-01-01 00:00:00',
    default_route: {
      ipv4: true,
    },
    id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    public: {
      ipv4: {
        addresses: [
          {
            address: '10.0.0.0',
            primary: true,
          },
        ],
        shared: [],
      },
      ipv6: {
        ranges: [],
        shared: [],
        slaac: [],
      },
    },
    updated: '2020-01-01 00:00:00',
    version: 1,
    vlan: null,
    vpc: null,
  }
);
