import { FirewallRules } from 'linode-js-sdk/lib/firewalls/types';

export type FirewallPreset = 'ssh' | 'http' | 'https' | 'mysql' | 'dns';

export const firewallOptionItems = [
  {
    label: 'SSH (TCP 22 - All IPv4, All IPv6)',
    value: 'ssh'
  },
  {
    label: 'HTTP (TCP 80 - All IPv4, All IPv6)',
    value: 'http'
  },
  {
    label: 'HTTPS (TCP 443 - All IPv4, All IPv6)',
    value: 'https'
  },
  {
    label: 'MySQL (TCP 3306 - All IPv4, All IPv6)',
    value: 'mysql'
  },
  {
    label: 'DNS (TCP 53 - All IPv4, All IPv6)',
    value: 'dns'
  }
];

export const predefinedFirewalls: Record<FirewallPreset, FirewallRules> = {
  ssh: {
    inbound: [
      {
        ports: '22',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ],
    outbound: [
      {
        ports: '22',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ]
  },
  http: {
    inbound: [
      {
        ports: '80',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ],
    outbound: [
      {
        ports: '80',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ]
  },
  https: {
    inbound: [
      {
        ports: '443',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ],
    outbound: [
      {
        ports: '443',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ]
  },
  mysql: {
    inbound: [
      {
        ports: '3306',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ],
    outbound: [
      {
        ports: '3306',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ]
  },
  dns: {
    inbound: [
      {
        ports: '53',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ],
    outbound: [
      {
        ports: '53',
        protocol: 'TCP',
        addresses: {
          ipv4: ['0.0.0.0/0'],
          ipv6: ['::0/0']
        }
      }
    ]
  }
};
