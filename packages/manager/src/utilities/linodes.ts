import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

import type {
  AccountMaintenance,
  Linode,
  LinodeTypeClass,
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
 *
 * The feature is disabled if:
 * 1. The feature flag is disabled, OR
 * 2. Both G7-dedicated and G8-dedicated plans are unavailable (ONLY for dedicated/premium plan classes)
 *
 * For plan classes other than 'dedicated' and 'premium' (e.g., 'gpu', 'highmem', 'standard'),
 * the feature is controlled solely by the feature flag, regardless of G7/G8 plan availability.
 *
 * @param plans - Array of plans to check for G7/G8 dedicated availability
 * @param planType - Plan class type (e.g., 'dedicated', 'gpu', 'premium')
 */
export const useIsGenerationalPlansEnabled = (
  plans: Array<{ id: string }> | undefined,
  planType: LinodeTypeClass | undefined
) => {
  const flags = useFlags();

  const isFlagEnabled = Boolean(flags.generationalPlansv2?.enabled);

  // If feature flag is disabled, return early
  if (!isFlagEnabled) {
    return {
      isGenerationalPlansEnabled: false,
      allowedPlans: flags.generationalPlansv2?.allowedPlans || [],
    };
  }

  // For plans other then dedicated/premium, or when no plans are provided,
  // rely solely on the feature flag without checking G7/G8 availability
  const shouldCheckG7G8Availability =
    planType === 'dedicated' || planType === 'premium';

  if (!plans || plans.length === 0 || !shouldCheckG7G8Availability) {
    return {
      isGenerationalPlansEnabled: isFlagEnabled,
      allowedPlans: flags.generationalPlansv2?.allowedPlans || [],
    };
  }

  // Check if G7-dedicated plans are available
  const hasG7DedicatedPlans = plans.some((plan) =>
    plan.id.startsWith('g7-dedicated-')
  );

  // Check if G8-dedicated plans are available
  const hasG8DedicatedPlans = plans.some((plan) =>
    plan.id.startsWith('g8-dedicated-')
  );

  // Disable generational plans feature if BOTH G7 and G8 dedicated plans are unavailable
  const shouldDisableDueToUnavailability =
    !hasG7DedicatedPlans && !hasG8DedicatedPlans;

  return {
    isGenerationalPlansEnabled:
      isFlagEnabled && !shouldDisableDueToUnavailability,
    allowedPlans: flags.generationalPlansv2?.allowedPlans || [],
  };
};
