export interface FirewallOption {
  label: string;
  value: any;
}

export const predefinedFirewalls: FirewallOption[] = [
  {
    label: 'SSH (TCP 22 - All IPv4, All IPv6)',
    value: {
      inbound: [
        {
          ports: '22',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ],
      outbound: [
        {
          ports: '22',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ]
    }
  },
  {
    label: 'HTTP (TCP 80 - All IPv4, All IPv6)',
    value: {
      inbound: [
        {
          ports: '80',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ],
      outbound: [
        {
          ports: '80',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ]
    }
  },
  {
    label: 'HTTPS (TCP 443 - All IPv4, All IPv6)',
    value: {
      inbound: [
        {
          ports: '443',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ],
      outbound: [
        {
          ports: '443',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ]
    }
  },
  {
    label: 'MySQL (TCP 3306 - All IPv4, All IPv6)',
    value: {
      inbound: [
        {
          ports: '3306',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ],
      outbound: [
        {
          ports: '3306',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ]
    }
  },
  {
    label: 'DNS (TCP 53 - All IPv4, All IPv6)',
    value: {
      inbound: [
        {
          ports: '53',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ],
      outbound: [
        {
          ports: '53',
          protocol: 'TCP',
          addresses: {
            ipv4: '0.0.0.0/0',
            ipv6: '::0/0'
          }
        }
      ]
    }
  }
];
