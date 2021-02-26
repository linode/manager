import {
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls/types';
import { Item } from 'src/components/EnhancedSelect/Select';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

export type FirewallPreset = 'ssh' | 'http' | 'https' | 'mysql' | 'dns';

// Predefined Firewall options for Select components (long-form).
export const firewallOptionItemsLong = [
  {
    label: 'SSH (TCP 22 - All IPv4, All IPv6)',
    value: 'ssh',
  },
  {
    label: 'HTTP (TCP 80 - All IPv4, All IPv6)',
    value: 'http',
  },
  {
    label: 'HTTPS (TCP 443 - All IPv4, All IPv6)',
    value: 'https',
  },
  {
    label: 'MySQL (TCP 3306 - All IPv4, All IPv6)',
    value: 'mysql',
  },
  {
    label: 'DNS (TCP 53 - All IPv4, All IPv6)',
    value: 'dns',
  },
];

// Predefined Firewall options for Select components (short-form).
export const firewallOptionItemsShort = [
  {
    label: 'SSH',
    value: 'ssh',
  },
  {
    label: 'HTTP',
    value: 'http',
  },
  {
    label: 'HTTPS',
    value: 'https',
  },
  {
    label: 'MySQL',
    value: 'mysql',
  },
  {
    label: 'DNS',
    value: 'dns',
  },
];

export const protocolOptions: Item<FirewallRuleProtocol>[] = [
  { label: 'TCP', value: 'TCP' },
  { label: 'ICMP', value: 'ICMP' },
  { label: 'UDP', value: 'UDP' },
];

export const addressOptions = [
  { label: 'All IPv4, All IPv6', value: 'all' },
  { label: 'All IPv4', value: 'allIPv4' },
  { label: 'All IPv6', value: 'allIPv6' },
  { label: 'IP / Netmask', value: 'ip/netmask' },
];

export const portPresets: Record<FirewallPreset, string> = {
  ssh: '22',
  http: '80',
  https: '443',
  mysql: '3306',
  dns: '53',
};

export const allIPv4 = '0.0.0.0/0';
export const allIPv6 = '::/0';

export const allIPs = {
  ipv4: [allIPv4],
  ipv6: [allIPv6],
};

export interface PredefinedFirewall {
  inbound: FirewallRuleType[];
  label: string;
}

export const predefinedFirewalls: Record<FirewallPreset, PredefinedFirewall> = {
  ssh: {
    label: 'SSH',
    inbound: [
      {
        ports: portPresets.ssh,
        protocol: 'TCP',
        addresses: allIPs,
        action: 'ACCEPT',
      },
    ],
  },
  http: {
    label: 'HTTP',
    inbound: [
      {
        ports: portPresets.http,
        protocol: 'TCP',
        addresses: allIPs,
        action: 'ACCEPT',
      },
    ],
  },
  https: {
    label: 'HTTPS',
    inbound: [
      {
        ports: portPresets.https,
        protocol: 'TCP',
        addresses: allIPs,
        action: 'ACCEPT',
      },
    ],
  },
  mysql: {
    label: 'MySQL',
    inbound: [
      {
        ports: portPresets.mysql,
        protocol: 'TCP',
        addresses: allIPs,
        action: 'ACCEPT',
      },
    ],
  },
  dns: {
    label: 'DNS',
    inbound: [
      {
        ports: portPresets.dns,
        protocol: 'TCP',
        addresses: allIPs,
        action: 'ACCEPT',
      },
    ],
  },
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

  switch (ports) {
    case portPresets.ssh:
      return 'ssh';
    case portPresets.http:
      return 'http';
    case portPresets.https:
      return 'https';
    case portPresets.mysql:
      return 'mysql';
    case portPresets.dns:
      return 'dns';
    default:
      return undefined;
  }
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
