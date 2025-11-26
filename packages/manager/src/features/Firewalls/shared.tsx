import { Box, Chip, Tooltip } from '@linode/ui';
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

export type PrefixListReference = { inIPv4Rule: boolean; inIPv6Rule: boolean };
export type PrefixListReferenceMap = Record<string, PrefixListReference>;

const isPrefixList = (ip: string) => ip.startsWith('pl:');

/**
 * Builds a map of Prefix List (PL) labels to their firewall rule references.
 *
 * @param addresses - Object containing optional arrays of IPv4 and IPv6 addresses.
 *                    Only addresses that are prefix lists (starting with 'pl:') are considered.
 * @returns A map where each key is a PL label, and the value indicates whether
 *          the PL is referenced in the IPv4 and/or IPv6 firewall rule.
 *
 * @example
 * const map = buildPrefixListReferenceMap({
 *   ipv4: ['pl:system:test1', '1.2.3.4'],
 *   ipv6: ['pl:system:test1', '::1']
 * });
 *
 * // Result:
 * // {
 * //   'pl:system:test1': { inIPv4Rule: true, inIPv6Rule: true }
 * // }
 */
export const buildPrefixListReferenceMap = (addresses: {
  ipv4?: string[];
  ipv6?: string[];
}): PrefixListReferenceMap => {
  const { ipv4 = [], ipv6 = [] } = addresses;

  const prefixListMap: PrefixListReferenceMap = {};

  // Handle IPv4
  ipv4.forEach((ip) => {
    if (isPrefixList(ip)) {
      if (!prefixListMap[ip]) {
        prefixListMap[ip] = { inIPv4Rule: false, inIPv6Rule: false };
      }
      prefixListMap[ip].inIPv4Rule = true;
    }
  });

  // Handle IPv6
  ipv6.forEach((ip) => {
    if (isPrefixList(ip)) {
      if (!prefixListMap[ip]) {
        prefixListMap[ip] = { inIPv4Rule: false, inIPv6Rule: false };
      }
      prefixListMap[ip].inIPv6Rule = true;
    }
  });

  return prefixListMap;
};

/**
 * Represents the Firewall Rule IP families to which a Prefix List (PL) is attached or referenced.
 *
 * Used for display and logic purposes, e.g., appending to a PL label in the UI as:
 * "pl:system:example (IPv4)", "pl:system:example (IPv6)", or "pl:system:example (IPv4, IPv6)".
 *
 * The value indicates which firewall IPs the PL applies to:
 * - "(IPv4)" -> PL is attached to Firewall Rule IPv4 only
 * - "(IPv6)" -> PL is attached to Firewall Rule IPv6 only
 * - "(IPv4, IPv6)" -> PL is attached to both Firewall Rule IPv4 and IPv6
 */
export type FirewallRulePrefixListReferenceTag =
  | '(IPv4)'
  | '(IPv4, IPv6)'
  | '(IPv6)';

interface GenerateAddressesLabelV2Options {
  /**
   * The list of addresses associated with a firewall rule.
   */
  addresses: FirewallRuleType['addresses'];
  /**
   * Optional callback invoked when a prefix list label is clicked.
   *
   * @param prefixListLabel - The label of the clicked prefix list (e.g., "pl:system:test")
   * @param plRuleRefTag - Indicates which firewall rule IP family(s) this PL belongs to: `(IPv4)`, `(IPv6)`, or `(IPv4, IPv6)`
   */
  onPrefixListClick?: (
    prefixListLabel: string,
    plRuleRefTag: FirewallRulePrefixListReferenceTag
  ) => void;
  /**
   * Whether to show the truncation "+N" chip with a scrollable tooltip
   * when there are more addresses than `truncateAt`.
   * @default true
   */
  showTruncateChip?: boolean;
  /**
   * Maximum number of addresses to show before truncation.
   * Ignored if `showTruncateChip` is false.
   * @default 1
   */
  truncateAt?: number;
}

/**
 * Generates IP addresses and clickable prefix lists (PLs) if available.
 * Can render either a full list of elements or a truncated list with a "+N" chip and a full list tooltip.
 *
 * - Detects prefix lists (`pl::` or `pl:system:`) and renders them as clickable links.
 * - Labels PLs across IPv4/IPv6 with rules reference suffixes:
 *     - Example PL: `pl:system:test`
 *     - Reference suffix: `(IPv4, IPv6)`, `(IPv4)`, or `(IPv6)`
 *     - Result: `pl:system:test (IPv4, IPv6)` or `pl:system:test (IPv4)` or `pl:system:test (IPv6)`
 * - Supports optional truncation with a "+N" chip and a full list tooltip.
 * - Reusable across components with configurable behavior.
 *
 * @param options - Configuration object including addresses, click handler, and truncation options.
 * @returns React elements representing addresses and clickable PLs, or `'None'` if empty.
 */
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

  // Build a map of prefix lists.
  // NOTE: If "allowedAllIPv4" or "allowedAllIPv6" is true, we skip those IPs entirely
  // because "All IPvX" is already represented, and there are no specific addresses to map.
  const ipv4ForPLMapping = allowedAllIPv4 ? [] : (addresses?.ipv4 ?? []);
  const ipv6ForPLMapping = allowedAllIPv6 ? [] : (addresses?.ipv6 ?? []);

  const prefixListReferenceMap = buildPrefixListReferenceMap({
    ipv4: ipv4ForPLMapping,
    ipv6: ipv6ForPLMapping,
  });

  // Add prefix list links with merged labels (eg., "pl:system:test (IPv4, IPv6)")
  Object.entries(prefixListReferenceMap).forEach(([pl, reference]) => {
    let plRuleRefTag = '' as FirewallRulePrefixListReferenceTag;
    if (reference.inIPv4Rule && reference.inIPv6Rule) {
      plRuleRefTag = '(IPv4, IPv6)';
    } else if (reference.inIPv4Rule) {
      plRuleRefTag = '(IPv4)';
    } else if (reference.inIPv6Rule) {
      plRuleRefTag = '(IPv6)';
    }

    elements.push(
      <Link
        key={pl}
        onClick={(e) => {
          e.preventDefault();
          onPrefixListClick?.(pl, plRuleRefTag);
        }}
      >
        {`${pl} ${plRuleRefTag}`}
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
    <Box
      sx={(theme) => ({
        maxHeight: '40vh',
        overflowY: 'auto',
        // Extra space on the right to prevent scrollbar from overlapping content
        paddingRight: theme.spacingFunction(8),
      })}
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
    </Box>
  );

  return (
    <>
      <Box
        component="span"
        sx={(theme) => ({
          // Only add gap if Chip is visible
          marginRight: hasMore ? theme.spacingFunction(8) : 0,
        })}
      >
        {truncated.map((el, idx) => (
          <React.Fragment key={idx}>
            {el}
            {idx < truncated.length - 1 && ', '}
          </React.Fragment>
        ))}
      </Box>
      {hasMore && (
        <Tooltip
          arrow
          placement="bottom"
          slotProps={{
            tooltip: {
              sx: (theme) => ({
                minWidth: '248px',
                padding: `${theme.spacingFunction(16)} !important`,
              }),
            },
          }}
          title={fullTooltip}
        >
          <Chip
            label={`+${hidden}`}
            sx={(theme) => ({
              cursor: 'pointer',
              borderRadius: '12px',
              minWidth: '33px',
              borderColor: theme.tokens.component.Tag.Default.Border,
              '&:hover': {
                borderColor: theme.tokens.alias.Content.Icon.Primary.Hover,
              },
              '& .MuiChip-label': {
                // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
                fontWeight: theme.tokens.font.FontWeight.Semibold,
              },
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
 * Returns whether or not features related to the Firewall Rulesets & Prefix Lists project
 * should be enabled, and whether they are in beta, LA, or GA.
 *
 * Note: Currently, this just uses the `fwRulesetsPrefixlists` feature flag as a source of truth,
 * but will eventually also look at account capabilities if available.
 */
export const useIsFirewallRulesetsPrefixlistsEnabled = () => {
  const flags = useFlags();

  // @TODO: Firewall Rulesets & Prefix Lists - check for customer tag/account capability when it exists
  return {
    isFirewallRulesetsPrefixlistsFeatureEnabled:
      flags.fwRulesetsPrefixLists?.enabled ?? false,
    isFirewallRulesetsPrefixListsBetaEnabled:
      flags.fwRulesetsPrefixLists?.beta ?? false,
    isFirewallRulesetsPrefixListsLAEnabled:
      flags.fwRulesetsPrefixLists?.la ?? false,
    isFirewallRulesetsPrefixListsGAEnabled:
      flags.fwRulesetsPrefixLists?.ga ?? false,
  };
};
