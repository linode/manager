import {
  FirewallRules,
  FirewallRuleType
} from 'linode-js-sdk/lib/firewalls/types';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

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

export const portPresets: Record<FirewallPreset, string> = {
  ssh: '22',
  http: '80',
  https: '443',
  mysql: '3306',
  dns: '53'
};

export const allIPv4 = '0.0.0.0/0';
export const allIPv6 = '::0/0';

const allIPs = {
  ipv4: [allIPv4],
  ipv6: [allIPv6]
};

export interface PredefinedFirewall extends FirewallRules {
  label: string;
}

export const predefinedFirewalls: Record<FirewallPreset, PredefinedFirewall> = {
  ssh: {
    label: 'SSH',
    inbound: [
      {
        ports: portPresets.ssh,
        protocol: 'TCP',
        addresses: allIPs
      }
    ],
    outbound: [
      {
        ports: portPresets.ssh,
        protocol: 'TCP',
        addresses: allIPs
      }
    ]
  },
  http: {
    label: 'HTTP',
    inbound: [
      {
        ports: portPresets.http,
        protocol: 'TCP',
        addresses: allIPs
      }
    ],
    outbound: [
      {
        ports: portPresets.http,
        protocol: 'TCP',
        addresses: allIPs
      }
    ]
  },
  https: {
    label: 'HTTPS',
    inbound: [
      {
        ports: portPresets.https,
        protocol: 'TCP',
        addresses: allIPs
      }
    ],
    outbound: [
      {
        ports: portPresets.https,
        protocol: 'TCP',
        addresses: allIPs
      }
    ]
  },
  mysql: {
    label: 'MySQL',
    inbound: [
      {
        ports: portPresets.mysql,
        protocol: 'TCP',
        addresses: allIPs
      }
    ],
    outbound: [
      {
        ports: portPresets.mysql,
        protocol: 'TCP',
        addresses: allIPs
      }
    ]
  },
  dns: {
    label: 'DNS',
    inbound: [
      {
        ports: portPresets.dns,
        protocol: 'TCP',
        addresses: allIPs
      }
    ],
    outbound: [
      {
        ports: portPresets.dns,
        protocol: 'TCP',
        addresses: allIPs
      }
    ]
  }
};

export const predefinedFirewallFromRule = (
  rule: FirewallRuleType
): FirewallPreset | undefined => {
  const { protocol, addresses, ports } = rule;

  // All predefined Firewalls have a protocol of TCP.
  if (protocol !== 'TCP') {
    return undefined;
  }

  // All predefined Firewalls allow all IPs.
  if (!allowsAllIPs(addresses)) {
    return undefined;
  }

  if (ports === portPresets.ssh) {
    return 'ssh';
  } else if (ports === portPresets.http) {
    return 'http';
  } else if (ports === portPresets.https) {
    return 'https';
  } else if (ports === portPresets.mysql) {
    return 'mysql';
  } else if (ports === portPresets.dns) {
    return 'dns';
  }

  return undefined;
};

export const allowsAllIPs = (addresses: FirewallRuleType['addresses']) =>
  allowAllIPv4(addresses) && allowAllIPv6(addresses);

export const allowAllIPv4 = (addresses: FirewallRuleType['addresses']) =>
  addresses?.ipv4?.includes(allIPv4);

export const allowAllIPv6 = (addresses: FirewallRuleType['addresses']) =>
  addresses?.ipv6?.includes(allIPv6);

export const generateRuleLabel = (ruleType?: FirewallPreset) =>
  ruleType ? predefinedFirewalls[ruleType].label : 'Custom';

export const generateAddressesLabel = (
  addresses: FirewallRuleType['addresses']
) => {
  const strBuilder: string[] = [];

  const allowedAllIPv4 = allowAllIPv4(addresses);
  const allowedAllIPv6 = allowAllIPv6(addresses);

  // First add the "All IPvX" strings so they always appear, even if the list
  // ends up being truncated.
  if (allowedAllIPv4) {
    strBuilder.push('All IPv4');
  }

  if (allowedAllIPv6) {
    strBuilder.push('All IPv6');
  }

  // Now we can look at the rest of the rules:
  if (!allowedAllIPv4) {
    addresses?.ipv4?.forEach(thisIP => {
      strBuilder.push(thisIP);
    });
  }

  if (!allowedAllIPv6) {
    addresses?.ipv6?.forEach(thisIP => {
      strBuilder.push(thisIP);
    });
  }

  if (strBuilder.length > 0) {
    return truncateAndJoinList(strBuilder, 3);
  }

  // If no IPs are allowed.
  return 'None';
};
