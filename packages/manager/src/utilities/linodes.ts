import { useFlags } from 'src/hooks/useFlags';

import type { AccountMaintenance, Linode } from '@linode/api-v4';

export interface Maintenance {
  when: null | string;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: Maintenance | null;
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

  // @TODO Linode Interfaces - check for customer tag when it exists

  return {
    isLinodeInterfacesEnabled: flags.linodeInterfaces?.enabled ?? false,
  };
};
