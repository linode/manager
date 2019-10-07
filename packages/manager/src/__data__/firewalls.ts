import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { FirewallWithSequence } from 'src/store/firewalls/firewalls.reducer';

export const firewall: Firewall = {
  id: 1,
  status: 'enabled',
  label: 'my-firewall',
  created_dt: '2019-09-11T19:44:38.526Z',
  updated_dt: '2019-09-11T19:44:38.526Z',
  tags: [],
  devices: {
    linodes: [16621754, 15922741]
  },
  rules: {
    inbound: [
      {
        protocol: 'ALL',
        start_port: 443
      }
    ],
    outbound: [
      {
        protocol: 'UDP',
        start_port: 22,
        addresses: {
          ipv4: ['12.12.12.12'],
          ipv6: ['192.168.12.12']
        }
      }
    ]
  }
};

export const firewall2: Firewall = {
  id: 2,
  status: 'disabled',
  label: 'zzz',
  created_dt: '2019-12-11T19:44:38.526Z',
  updated_dt: '2019-12-11T19:44:38.526Z',
  tags: [],
  devices: {
    linodes: [15922741]
  },
  rules: {
    inbound: [],
    outbound: [
      {
        protocol: 'ALL',
        start_port: 443
      },
      {
        protocol: 'ALL',
        start_port: 80
      }
    ]
  }
};

const firewallWithSequence: FirewallWithSequence = {
  ...firewall,
  rules: {
    inbound: (firewall.rules.inbound || []).map((eachRule, index) => ({
      ...eachRule,
      sequence: index + 1
    })),
    outbound: (firewall.rules.outbound || []).map((eachRule, index) => ({
      ...eachRule,
      sequence: index + 1
    }))
  }
};

const firewallWithSequence2: FirewallWithSequence = {
  ...firewall2,
  rules: {
    inbound: (firewall2.rules.inbound || []).map((eachRule, index) => ({
      ...eachRule,
      sequence: index + 1
    })),
    outbound: (firewall2.rules.outbound || []).map((eachRule, index) => ({
      ...eachRule,
      sequence: index + 1
    }))
  }
};

export const firewallsWithSequence = [
  firewallWithSequence,
  firewallWithSequence2
];

export const firewalls = [firewall, firewall2];
