import { prop, sortBy } from 'ramda';

import type { APIError } from '@linode/api-v4/lib/types';
export type Category = 'inbound' | 'outbound';

export interface FirewallRuleError {
  category: string;
  formField: string;
  idx: number;
  ip?: {
    idx: number;
    type: string;
  };
  reason: string;
}

// This is not the most efficient or elegant data structure ever,
// but it makes it easier to test and work with presets without having to .find()
// in multiple places.
export const PORT_PRESETS = {
  '22': { label: 'SSH (22)', value: '22' },
  '53': { label: 'DNS (53)', value: '53' },
  '80': { label: 'HTTP (80)', value: '80' },
  '443': { label: 'HTTPS (443)', value: '443' },
  '3306': { label: 'MySQL (3306)', value: '3306' },
  ALL: { label: 'Allow All', value: '1-65535' },
  CUSTOM: { label: 'Custom', value: 'CUSTOM' },
};

export const PORT_PRESETS_ITEMS = sortBy(
  prop('label'),
  Object.values(PORT_PRESETS)
);

/**
 * The API returns very good Firewall error messages that look like this:
 *
 *   {
 *     "reason": "Must contain only valid IPv4 addresses or networks",
 *     "field": "rules.inbound[0].addresses.ipv4[0]"
 *   }
 *
 * This function parses the "field" into a data structure usable by downstream components.
 */
export const parseFirewallRuleError = (
  error: APIError
): FirewallRuleError | null => {
  const { field, reason } = error;

  if (!field) {
    return null;
  }

  const category = field.match(/inbound|outbound/)?.[0];
  const idx = field.match(/\d+/)?.[0];
  const formField = field.match(/ports|protocol|addresses/)?.[0];
  const ipType = field.match(/ipv4|ipv6/)?.[0];
  const ipIdx = field.match(/(ipv4|ipv6)\[(\d+)\]/)?.[2];

  if (!category || !idx || !formField) {
    return null;
  }

  const result: FirewallRuleError = {
    category,
    formField,
    idx: +idx,
    reason,
  };

  if (ipType && ipIdx) {
    result.ip = {
      idx: +ipIdx,
      type: ipType,
    };
  }

  return result;
};

/**
 * Sorts ports string returned by the API into something more intuitive for users.
 * Examples:
 * "80, 22" --> "22, 80"
 * "443, 22, 80-81" --> "22, 80-81, 443"
 */
export const sortPortString = (portString: string) => {
  try {
    const ports = portString.split(',');
    return ports
      .sort(sortString)
      .map((port) => port.trim())
      .join(', ');
  } catch {
    // API responses should always work with this logic,
    // but in case we get bad input, return the unsorted/unaltered string.
    return portString;
  }
};

// Custom sort helper for working with port strings
export const sortString = (_a: string, _b: string) => {
  const a = Number(stripHyphen(_a));
  const b = Number(stripHyphen(_b));
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

// If a port range is included (80-1000) return the first element of the range
const stripHyphen = (str: string) => {
  return str.match(/-/) ? str.split('-')[0] : str;
};
