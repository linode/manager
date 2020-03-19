import { APIError } from 'linode-js-sdk/lib/types';

export type Category = 'inbound' | 'outbound';

export interface FirewallRuleError {
  reason: string;
  category: string;
  idx: number;
  formField: string;
  ip?: {
    type: string;
    idx: number;
  };
}

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
  const { reason, field } = error;

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
    reason,
    category,
    idx: +idx,
    formField,
    ip: undefined
  };

  if (ipType && ipIdx) {
    result.ip = {
      type: ipType,
      idx: +ipIdx
    };
  }

  return result;
};
