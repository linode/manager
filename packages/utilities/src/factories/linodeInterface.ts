// Factories for the new Linode Interfaces type

import { Factory } from './factoryProxy';

import type { LinodeInterface, LinodeInterfaceSettings } from '@linode/api-v4';

export const linodeInterfaceSettingsFactory =
  Factory.Sync.makeFactory<LinodeInterfaceSettings>({
    network_helper: false,
    default_route: {
      ipv4_interface_id: 1,
      ipv4_eligible_interface_ids: [],
      ipv6_interface_id: 1,
      ipv6_eligible_interface_ids: [],
    },
  });

export const linodeInterfaceFactoryVlan =
  Factory.Sync.makeFactory<LinodeInterface>({
    created: '2025-03-19T03:58:04',
    default_route: {
      ipv4: true,
    },
    id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    public: null,
    updated: '2025-03-19T03:58:04',
    version: 1,
    vlan: {
      ipam_address: '192.168.0.1',
      vlan_label: 'vlan-interface',
    },
    vpc: null,
  });

export const linodeInterfaceFactoryVPC =
  Factory.Sync.makeFactory<LinodeInterface>({
    created: '2025-03-19T03:58:04',
    default_route: {
      ipv4: true,
    },
    id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    public: null,
    updated: '2025-03-19T03:58:04',
    version: 1,
    vlan: null,
    vpc: {
      ipv4: {
        addresses: [
          {
            address: '10.0.0.0',
            primary: true,
          },
          {
            address: '10.0.1.0',
            primary: false,
          },
        ],
        ranges: [{ range: '10.0.0.1' }],
      },
      ipv6: {
        is_public: false,
        ranges: [
          {
            range: '2600:3c03::f03c:91ff:fe0a:109a',
          },
        ],
        slaac: [
          {
            address: '2600:3c03::f03c:91ff:fe0a:109a',
            range: '2600:3c03::/64',
          },
        ],
      },
      subnet_id: 1,
      vpc_id: 1,
    },
  });

export const linodeInterfaceFactoryPublic =
  Factory.Sync.makeFactory<LinodeInterface>({
    created: '2025-03-19T03:58:04',
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
    updated: '2025-03-19T03:58:04',
    version: 1,
    vlan: null,
    vpc: null,
  });
