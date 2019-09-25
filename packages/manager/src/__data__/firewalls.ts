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
          start_port: 443
        }
      ]
    },
    {
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
  ]
};

export const firewall2: Firewall = {
  id: 2,
  status: 'disabled',
  label: 'zzz',
  created_dt: '2019-12-11T19:44:38.526Z',
  updated_dt: '2019-12-11T19:44:38.526Z',
  tags: [],
  devices: {
    linodes: [123]
  },
  rules: [
    {
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
    },
    {
      inbound: [
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
  ]
};

export const firewalls = [firewall, firewall2];
