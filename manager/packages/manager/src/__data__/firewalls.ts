import { Firewall } from '@linode/api-v4/lib/firewalls';

export const firewall: Firewall = {
  id: 1,
  status: 'enabled',
  label: 'my-firewall',
  created_dt: '2019-09-11T19:44:38.526Z',
  updated_dt: '2019-09-11T19:44:38.526Z',
  tags: [],
  rules: {
    inbound_policy: 'DROP',
    outbound_policy: 'DROP',
    inbound: [
      {
        protocol: 'ALL',
        ports: '443',
        action: 'ACCEPT',
      },
    ],
    outbound: [
      {
        protocol: 'UDP',
        ports: '22',
        addresses: {
          ipv4: ['12.12.12.12'],
          ipv6: ['192.168.12.12'],
        },
        action: 'ACCEPT',
      },
    ],
  },
};

export const firewall2: Firewall = {
  id: 2,
  status: 'disabled',
  label: 'zzz',
  created_dt: '2019-12-11T19:44:38.526Z',
  updated_dt: '2019-12-11T19:44:38.526Z',
  tags: [],
  rules: {
    inbound_policy: 'DROP',
    outbound_policy: 'DROP',
    inbound: [],
    outbound: [
      {
        protocol: 'ALL',
        ports: '443',
        action: 'ACCEPT',
      },
      {
        protocol: 'ALL',
        ports: '80',
        action: 'ACCEPT',
      },
    ],
  },
};

export const firewalls = [firewall, firewall2];
