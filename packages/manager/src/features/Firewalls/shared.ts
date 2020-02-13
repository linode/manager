export interface FirewallOption {
  label: string;
  value: any;
}

export const predefinedFirewalls: FirewallOption[] = [
  {
    label: 'SSH (TCP 22)',
    value: {
      inbound: [
        {
          ports: '22',
          protocol: 'TCP',
          addresses: {}
        }
      ],
      outbound: [
        {
          ports: '22',
          protocol: 'TCP',
          addresses: {}
        }
      ]
    }
  },
  {
    label: 'HTTP (TCP 80)',
    value: {
      inbound: [
        {
          ports: '80',
          protocol: 'TCP',
          addresses: {}
        }
      ],
      outbound: [
        {
          ports: '80',
          protocol: 'TCP',
          addresses: {}
        }
      ]
    }
  },
  {
    label: 'HTTPS (TCP 443)',
    value: {
      inbound: [
        {
          ports: '443',
          protocol: 'TCP',
          addresses: {}
        }
      ],
      outbound: [
        {
          ports: '443',
          protocol: 'TCP',
          addresses: {}
        }
      ]
    }
  },
  {
    label: 'MySQL (TCP 3306)',
    value: {
      inbound: [
        {
          ports: '3306',
          protocol: 'TCP',
          addresses: {}
        }
      ],
      outbound: [
        {
          ports: '3306',
          protocol: 'TCP',
          addresses: {}
        }
      ]
    }
  },
  {
    label: 'DNS (TCP 53)',
    value: {
      inbound: [
        {
          ports: '53',
          protocol: 'TCP',
          addresses: {}
        }
      ],
      outbound: [
        {
          ports: '53',
          protocol: 'TCP',
          addresses: {}
        }
      ]
    }
  }
];
