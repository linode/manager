import { useAccountSettings, useRegionQuery } from '@linode/queries';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import type { InterfaceGenerationType } from '@linode/api-v4';

export type CannotUpgradeInterfaceReasons =
  | 'isLegacyConfigOnlyAccount'
  | 'isLkeLinode'
  | 'regionUnsupported';

/**
 * Hook to determine whether to show Upgrade Interface features for a Linode with the given
 * LKE cluster, region, and interface type.
 *
 * The Linode must be using legacy interfaces to be upgraded. Additionally,
 * if the Linode is part of a cluster, is in a region that doesn't allow Linode
 * Interfaces, or if the customer's account settings specify only legacy
 * interfaces can be used, then the Linode cannot be upgraded.
 */
export const useCanUpgradeInterfaces = (
  linodeLkeId: null | number | undefined,
  linodeRegion: string | undefined,
  interfaceType: InterfaceGenerationType | undefined
) => {
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { data: region } = useRegionQuery(linodeRegion ?? '');
  const { data: accountSettings } = useAccountSettings();

  const regionSupportsLinodeInterfaces =
    region?.capabilities.includes('Linode Interfaces') ?? false;

  const isLegacyConfigOnlyAccount =
    accountSettings?.interfaces_for_new_linodes === 'legacy_config_only';

  const canUpgradeInterfaces =
    // show the Upgrade Interfaces button if our Linode is not part of an LKE cluster, is
    // using Legacy config profile interfaces in a region that supports the new Interfaces
    // and our account can have Linodes using new interfaces
    isLinodeInterfacesEnabled &&
    interfaceType !== 'linode' &&
    !linodeLkeId &&
    !isLegacyConfigOnlyAccount &&
    regionSupportsLinodeInterfaces;

  const unableToUpgradeReasons: CannotUpgradeInterfaceReasons[] = [];
  if (!!linodeLkeId) {
    unableToUpgradeReasons.push('isLkeLinode');
  }
  if (isLegacyConfigOnlyAccount) {
    unableToUpgradeReasons.push('isLegacyConfigOnlyAccount');
  }
  if (!regionSupportsLinodeInterfaces) {
    unableToUpgradeReasons.push('regionUnsupported');
  }

  return {
    canUpgradeInterfaces,
    unableToUpgradeReasons,
  };
};
