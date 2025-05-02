import type { Firewall } from '@linode/api-v4/lib/firewalls';
import type { FirewallDeviceEntityType } from '@linode/api-v4/lib/firewalls';

export const firewall: Firewall = {
  created: '2019-09-11T19:44:38.526Z',
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
    fingerprint: '8a545843',
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
    version: 1,
  },
  status: 'enabled',
  tags: [],
  updated: '2019-09-11T19:44:38.526Z',
};

export const firewall2: Firewall = {
  created: '2019-12-11T19:44:38.526Z',
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
    fingerprint: '8a545843',
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
    version: 1,
  },
  status: 'disabled',
  tags: [],
  updated: '2019-12-11T19:44:38.526Z',
};

export const firewalls = [firewall, firewall2];
