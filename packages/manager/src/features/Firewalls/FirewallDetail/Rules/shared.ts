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
 * Given an array of API errors, parse them and put them into `inbound` and `outbound buckets.
 */
export const parseFirewallRuleErrors = (errors: APIError[] = []) => {
  return errors?.reduce<{
    inbound: FirewallRuleError[];
    outbound: FirewallRuleError[];
  }>(
    (acc, thisError) => {
      const parsedError = parseFirewallRuleError(thisError);

      if (parsedError !== null) {
        acc[parsedError.category].push(parsedError);
      }

      return acc;
    },
    { inbound: [], outbound: [] }
  );
};

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
