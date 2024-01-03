import { Firewall } from '@linode/api-v4/lib/firewalls';
import { FirewallDeviceEntityType } from '@linode/api-v4/lib/firewalls';

export const firewall: Firewall = {
  created_dt: '2019-09-11T19:44:38.526Z',
  entities: [
    {
      id: 1,
      label: 'my-linode',
      type: 'linode' as FirewallDeviceEntityType,
      url: '/test',
    },
  ],
  id: 1,
  label: 'my-firewall',
  rules: {
    inbound: [
      {
        action: 'ACCEPT',
        ports: '443',
        protocol: 'ALL',
      },
    ],
    inbound_policy: 'DROP',
    outbound: [
      {
        action: 'ACCEPT',
        addresses: {
          ipv4: ['12.12.12.12'],
          ipv6: ['192.168.12.12'],
        },
        ports: '22',
        protocol: 'UDP',
      },
    ],
    outbound_policy: 'DROP',
  },
  status: 'enabled',
  tags: [],
  updated_dt: '2019-09-11T19:44:38.526Z',
};

export const firewall2: Firewall = {
  created_dt: '2019-12-11T19:44:38.526Z',
  entities: [
    {
      id: 1,
      label: 'my-linode',
      type: 'linode' as FirewallDeviceEntityType,
      url: '/test',
    },
  ],
  id: 2,
  label: 'zzz',
  rules: {
    inbound: [],
    inbound_policy: 'DROP',
    outbound: [
      {
        action: 'ACCEPT',
        ports: '443',
        protocol: 'ALL',
      },
      {
        action: 'ACCEPT',
        ports: '80',
        protocol: 'ALL',
      },
    ],
    outbound_policy: 'DROP',
  },
  status: 'disabled',
  tags: [],
  updated_dt: '2019-12-11T19:44:38.526Z',
};

export const firewalls = [firewall, firewall2];
