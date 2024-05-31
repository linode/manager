import {
  Firewall,
  deleteFirewall,
  getFirewalls,
  createFirewall,
} from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { randomLabel } from 'support/util/random';

import { isTestLabel } from './common';

/**
 * Determines if a Firewall is sufficiently locked down to use for a test resource.
 *
 * Returns `true` if the Firewall has default inbound and outbound policies to
 * drop connections and does not have any additional rules.
 *
 * @param firewall - Firewall for which to check rules and policies.
 *
 * @returns `true` if Firewall is locked down, `false` otherwise.
 */
export const isFirewallLockedDown = (firewall: Firewall) => {
  const hasOutboundRules =
    !!firewall.rules.outbound && firewall.rules.outbound.length > 0;
  const hasInboundRules =
    !!firewall.rules.inbound && firewall.rules.inbound.length > 0;

  const hasOutboundDropPolicy = firewall.rules.outbound_policy === 'DROP';
  const hasInboundDropPolicy = firewall.rules.inbound_policy === 'DROP';

  return (
    hasInboundDropPolicy &&
    hasOutboundDropPolicy &&
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
    (firewall: Firewall) =>
      isTestLabel(firewall.label) && isFirewallLockedDown(firewall)
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
