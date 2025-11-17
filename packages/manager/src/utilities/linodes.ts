import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

import type {
  AccountMaintenance,
  Linode,
  MaintenancePolicySlug,
} from '@linode/api-v4';

export interface LinodeMaintenance {
  maintenance_policy_set: MaintenancePolicySlug;
  start_time: null | string;
  status?:
    | 'canceled'
    | 'completed'
    | 'in_progress'
    | 'pending'
    | 'scheduled'
    | 'started';
  when: null | string;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: LinodeMaintenance | null;
}

export const addMaintenanceToLinodes = (
  accountMaintenance: AccountMaintenance[],
  linodes: Linode[]
): LinodeWithMaintenance[] => {
  return linodes.map((thisLinode) => {
    const foundMaintenance = accountMaintenance.find((thisMaintenance) => {
      return (
        thisMaintenance.entity.type === 'linode' &&
        thisMaintenance.entity.id === thisLinode.id
      );
    });

    return foundMaintenance
      ? {
          ...thisLinode,
          maintenance: {
            maintenance_policy_set: foundMaintenance.maintenance_policy_set,
            start_time: foundMaintenance.start_time,
            status: foundMaintenance.status,
            when: foundMaintenance.when,
          },
        }
      : { ...thisLinode, maintenance: null };
  });
};

/**
 * Returns whether or not features related to the *Linode Interfaces* project
 * should be enabled.
 *
 * Currently, this just uses the `linodeInterfaces` feature flag as a source of truth,
 * but will eventually also look at account capabilities.
 */
export const useIsLinodeInterfacesEnabled = () => {
  const flags = useFlags();
  const { data: account } = useAccount();

  return {
    isLinodeInterfacesEnabled: isFeatureEnabledV2(
      'Linode Interfaces',
      flags.linodeInterfaces?.enabled ?? false,
      account?.capabilities ?? []
    ),
  };
};

/**
 * Returns whether or not the feature for attaching Firewalls in the *Linode Clone*
 * flow should be enabled.
 *
 * Currently, this just uses the `linodeCloneFirewall` feature flag as a source of truth,
 * but will eventually also look at Linode API for this capability.
 */
export const useIsLinodeCloneFirewallEnabled = () => {
  const flags = useFlags();

  // @TODO Clone Linode Firewalls: check for firewall attachment capability in Linode API when it exists

  return {
    isLinodeCloneFirewallEnabled: Boolean(flags.linodeCloneFirewall),
  };
};

/**
 * Returns whether or not features related to the Generational Compute Plans
 * should be enabled.
 */
export const useIsGenerationalPlansEnabled = () => {
  const flags = useFlags();

  return {
    isGenerationalPlansEnabled: Boolean(flags.generationalPlansv2?.enabled),
    allowedPlans: flags.generationalPlansv2?.allowedPlans || [],
  };
};
