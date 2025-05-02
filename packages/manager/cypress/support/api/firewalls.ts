import { createFirewall, deleteFirewall, getFirewalls } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { randomLabel } from 'support/util/random';

import { isTestLabel } from './common';

import type { Firewall, FirewallRules } from '@linode/api-v4';

/**
 * Determines if Firewall rules are sufficiently locked down to use for a test resource.
 *
 * Returns `true` if the rules have default inbound and outbound policies to
 * drop connections and do not have any additional rules.
 *
 * @param rules - Firewall rules to assess.
 *
 * @returns `true` if Firewall rules are locked down, `false` otherwise.
 */
export const areFirewallRulesLockedDown = (rules: FirewallRules) => {
  const { outbound, outbound_policy, inbound, inbound_policy } = rules;

  const hasOutboundRules = !!outbound && outbound.length > 0;
  const hasInboundRules = !!inbound && inbound.length > 0;

  return (
    outbound_policy === 'DROP' &&
    inbound_policy === 'DROP' &&
    !hasInboundRules &&
    !hasOutboundRules
  );
};

/**
 * Returns a firewall to use for a test resource, creating it if one does not already exist.
 *
 * @returns Promise that resolves to existing or new Firewall.
 */
export const findOrCreateDependencyFirewall = async () => {
  const firewalls = await depaginate<Firewall>((page: number) =>
    getFirewalls({ page, page_size: pageSize })
  );

  const suitableFirewalls = firewalls.filter(
    ({ label, rules }: Firewall) =>
      isTestLabel(label) && areFirewallRulesLockedDown(rules)
  );

  if (suitableFirewalls.length > 0) {
    return suitableFirewalls[0];
  }

  // No suitable firewalls exist, so we'll create one and return it.
  return createFirewall({
    label: randomLabel(),
    rules: {
      inbound: [],
      outbound: [],
      inbound_policy: 'DROP',
      outbound_policy: 'DROP',
    },
  });
};

/**
 * Deletes all Firewalls whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Firewalls have been deleted.
 */
export const deleteAllTestFirewalls = async (): Promise<void> => {
  const firewalls = await depaginate<Firewall>((page: number) =>
    getFirewalls({ page, page_size: pageSize })
  );

  const deletionPromises = firewalls
    .filter((firewall: Firewall) => isTestLabel(firewall.label))
    .map((firewall: Firewall) => deleteFirewall(firewall.id));

  await Promise.all(deletionPromises);
};
