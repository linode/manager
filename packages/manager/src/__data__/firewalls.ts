import { Firewall } from 'linode-js-sdk/lib/firewalls';

export const firewall: Firewall = {
  id: 1,
  status: 'enabled',
  label: 'my-firewall',
  created_dt: '2019-09-11T19:44:38.526Z',
  updated_dt: '2019-09-11T19:44:38.526Z',
  tags: [],
  devices: {
    linodes: []
  },
  rules: [
    {
      inbound: [
        {
          protocol: 'ALL',
          start_port: 443,
          sequence: 1
        }
      ]
    },
    {
      outbound: [
        {
          protocol: 'UDP',
          start_port: 22,
          sequence: 1,
          addresses: {
            ipv4: ['12.12.12.12'],
            ipv6: ['192.168.12.12']
          }
        }
      ]
    }
  ]
};

export const firewall2: Firewall = {
  id: 2,
  status: 'enabled',
  label: 'my-firewall-2',
  created_dt: '2019-12-11T19:44:38.526Z',
  updated_dt: '2019-12-11T19:44:38.526Z',
  tags: [],
  devices: {
    linodes: [123]
  },
  rules: [
    {
      outbound: [
        {
          protocol: 'ALL',
          start_port: 443,
          sequence: 1
        }
      ]
    },
    {
      inbound: [
        {
          protocol: 'UDP',
          start_port: 22,
          sequence: 1,
          addresses: {
            ipv4: ['12.12.12.12'],
            ipv6: ['192.168.12.12']
          }
        }
      ]
    }
  ]
};

export const firewalls = [firewall, firewall2];
