import { Chip, Tooltip } from '@linode/ui';
import { capitalize, truncateAndJoinList } from '@linode/utilities';
import React from 'react';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import type { PORT_PRESETS } from './FirewallDetail/Rules/shared';
import type {
  Firewall,
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls/types';

export type FirewallPreset = 'dns' | 'http' | 'https' | 'mysql' | 'ssh';

/**
 * Represents the Firewall IP families to which a Prefix List (PL) is attached or referenced.
 *
 * Used for display and logic purposes, e.g., appending to a PL label in the UI as:
 * "pl:system:example (IPv4)", "pl:system:example (IPv6)", or "pl:system:example (IPv4, IPv6)".
 *
 * The value indicates which firewall IPs the PL applies to:
 * - "(IPv4)" -> PL is attached to Firewall IPv4 only
 * - "(IPv6)" -> PL is attached to Firewall IPv6 only
 * - "(IPv4, IPv6)" -> PL is attached to both Firewall IPv4 and IPv6
 */
export type FirewallIPPrefixListReference =
  | '(IPv4)'
  | '(IPv4, IPv6)'
  | '(IPv6)';

export interface FirewallOptionItem<T = number | string, L = string> {
  label: L;
  value: T;
}
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
] as const;

export const protocolOptions: FirewallOptionItem<FirewallRuleProtocol>[] = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'ICMP', value: 'ICMP' },
  { label: 'IPENCAP', value: 'IPENCAP' },
];

export const addressOptions = [
  { label: 'All IPv4, All IPv6', value: 'all' },
  { label: 'All IPv4', value: 'allIPv4' },
  { label: 'All IPv6', value: 'allIPv6' },
  { label: 'IP / Netmask', value: 'ip/netmask' },
];

export const portPresets: Record<FirewallPreset, keyof typeof PORT_PRESETS> = {
  dns: '53',
  http: '80',
  https: '443',
  mysql: '3306',
  ssh: '22',
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
  dns: {
    inbound: [
      {
        action: 'ACCEPT',
        addresses: allIPs,
        label: `accept-inbound-DNS`,
        ports: portPresets.dns,
        protocol: 'TCP',
      },
    ],
    label: 'DNS',
  },
  http: {
    inbound: [
      {
        action: 'ACCEPT',
        addresses: allIPs,
        label: `accept-inbound-HTTP`,
        ports: portPresets.http,
        protocol: 'TCP',
      },
    ],
    label: 'HTTP',
  },
  https: {
    inbound: [
      {
        action: 'ACCEPT',
        addresses: allIPs,
        label: `accept-inbound-HTTPS`,
        ports: portPresets.https,
        protocol: 'TCP',
      },
    ],
    label: 'HTTPS',
  },
  mysql: {
    inbound: [
      {
        action: 'ACCEPT',
        addresses: allIPs,
        label: `accept-inbound-MYSQL`,
        ports: portPresets.mysql,
        protocol: 'TCP',
      },
    ],
    label: 'MySQL',
  },
  ssh: {
    inbound: [
      {
        action: 'ACCEPT',
        addresses: allIPs,
        label: `accept-inbound-SSH`,
        ports: portPresets.ssh,
        protocol: 'TCP',
      },
    ],
    label: 'SSH',
  },
};

export const predefinedFirewallFromRule = (
  rule: FirewallRuleType
): FirewallPreset | undefined => {
  const { addresses, ports, protocol } = rule;

  // All predefined Firewalls have a protocol of TCP.
  if (protocol !== 'TCP') {
    return undefined;
  }

  // All predefined Firewalls allow all IPs.
  if (!allowsAllIPs(addresses)) {
    return undefined;
  }

  switch (ports) {
    case portPresets.dns:
      return 'dns';
    case portPresets.http:
      return 'http';
    case portPresets.https:
      return 'https';
    case portPresets.mysql:
      return 'mysql';
    case portPresets.ssh:
      return 'ssh';
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

export const allowNoneIPv4 = (addresses: FirewallRuleType['addresses']) =>
  !addresses?.ipv4?.length;

export const allowNoneIPv6 = (addresses: FirewallRuleType['addresses']) =>
  !addresses?.ipv6?.length;

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
    addresses?.ipv4?.forEach((thisIP) => {
      strBuilder.push(thisIP);
    });
  }

  if (!allowedAllIPv6) {
    addresses?.ipv6?.forEach((thisIP) => {
      strBuilder.push(thisIP);
    });
  }

  if (strBuilder.length > 0) {
    return truncateAndJoinList(strBuilder, 3);
  }

  // If no IPs are allowed.
  return 'None';
};

interface GenerateAddressesLabelV2Options {
  addresses: FirewallRuleType['addresses'];
  onPrefixListClick?: (
    prefixListLabel: string,
    plFirewallIPRef: FirewallIPPrefixListReference
  ) => void;
  showTruncateChip?: boolean; // default true
  truncateAt?: number; // default 1
}

export const generateAddressesLabelV2 = (
  options: GenerateAddressesLabelV2Options
) => {
  const {
    addresses,
    onPrefixListClick,
    showTruncateChip = true,
    truncateAt = 1,
  } = options;
  const elements: React.ReactNode[] = [];

  const allowedAllIPv4 = allowAllIPv4(addresses);
  const allowedAllIPv6 = allowAllIPv6(addresses);

  // First add "All IPvX" items
  if (allowedAllIPv4 && allowedAllIPv6) {
    elements.push('All IPv4, All IPv6');
  } else if (allowedAllIPv4) {
    elements.push('All IPv4');
  } else if (allowedAllIPv6) {
    elements.push('All IPv6');
  }

  const isPrefixList = (ip: string) => ip.startsWith('pl:');

  // Build a map of prefix lists
  const prefixMap: Record<string, { ipv4: boolean; ipv6: boolean }> = {};

  if (!allowedAllIPv4) {
    addresses?.ipv4?.forEach((ip) => {
      if (isPrefixList(ip)) {
        if (!prefixMap[ip]) {
          prefixMap[ip] = { ipv4: false, ipv6: false };
        }
        prefixMap[ip].ipv4 = true;
      }
    });
  }

  if (!allowedAllIPv6) {
    addresses?.ipv6?.forEach((ip) => {
      if (isPrefixList(ip)) {
        if (!prefixMap[ip]) {
          prefixMap[ip] = { ipv4: false, ipv6: false };
        }
        prefixMap[ip].ipv6 = true;
      }
    });
  }

  // Add prefix list links with merged labels (eg., "pl:system:test (IPv4, IPv6)")
  Object.entries(prefixMap).forEach(([pl, presence]) => {
    let plFirewallIPRef = '' as FirewallIPPrefixListReference;
    if (presence.ipv4 && presence.ipv6) {
      plFirewallIPRef = '(IPv4, IPv6)';
    } else if (presence.ipv4) {
      plFirewallIPRef = '(IPv4)';
    } else if (presence.ipv6) {
      plFirewallIPRef = '(IPv6)';
    }

    elements.push(
      <Link
        key={pl}
        onClick={(e) => {
          e.preventDefault();
          onPrefixListClick?.(pl, plFirewallIPRef);
        }}
      >
        {`${pl} ${plFirewallIPRef}`}
      </Link>
    );
  });

  // Add remaining IPv4 addresses that are not prefix lists
  if (!allowedAllIPv4) {
    addresses?.ipv4?.forEach((ip) => {
      if (!isPrefixList(ip)) {
        elements.push(<span key={ip}>{ip}</span>);
      }
    });
  }

  // Add remaining IPv6 addresses that are not prefix lists
  if (!allowedAllIPv6) {
    addresses?.ipv6?.forEach((ip) => {
      if (!isPrefixList(ip)) {
        elements.push(<span key={ip}>{ip}</span>);
      }
    });
  }

  // If no IPs are allowed
  if (elements.length === 0) return 'None';

  //  Truncation / Chip logic
  const truncated = showTruncateChip ? elements.slice(0, truncateAt) : elements;
  const hidden = elements.length - truncateAt;
  const hasMore = showTruncateChip && elements.length > truncateAt;

  const fullTooltip = (
    <div
      style={{
        maxHeight: '40vh',
        overflowY: 'auto',
        paddingRight: 8,
      }}
    >
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingLeft: 20,
          margin: 0,
        }}
      >
        {elements.map((el, i) => (
          <li key={i} style={{ listStyleType: 'disc' }}>
            {el}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {truncated.map((el, idx) => (
        <React.Fragment key={idx}>
          {el}
          {idx < truncated.length - 1 && ', '}
        </React.Fragment>
      ))}

      {hasMore && (
        <Tooltip
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                minWidth: '248px',
              },
            },
          }}
          placement="bottom"
          title={fullTooltip}
        >
          <Chip
            label={`+${hidden}`}
            size="small"
            sx={(theme) => ({
              cursor: 'pointer',
              marginLeft: theme.spacingFunction(8),
              borderRadius: '12px',
              minWidth: '33px',
            })}
            variant="outlined"
          />
        </Tooltip>
      )}
    </>
  );
};

export const getFirewallDescription = (firewall: Firewall) => {
  const description = [
    `Status: ${capitalize(firewall.status)}`,
    `Services Assigned: ${firewall.entities.length}`,
  ];
  return description.join(', ');
};

/**
 * Returns whether or not features related to the Firewall Rulesets & Prefixlists project
 * should be enabled.
 *
 * Note: Currently, this just uses the `firewallRulesetsPrefixlists` feature flag as a source of truth,
 * but will eventually also look at account capabilities if available.
 */
export const useIsFirewallRulesetsPrefixlistsEnabled = () => {
  const flags = useFlags();

  // @TODO: Firewall Rulesets & Prefixlists - check for customer tag/account capability when it exists
  return {
    isFirewallRulesetsPrefixlistsEnabled:
      flags.firewallRulesetsPrefixlists ?? false,
  };
};
