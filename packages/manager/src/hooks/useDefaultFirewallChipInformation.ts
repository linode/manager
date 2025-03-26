import { useFirewallSettingsQuery } from '@linode/queries';

import {
  getDefaultFirewallDescription,
  getEntitiesThatFirewallIsDefaultFor,
} from 'src/features/Firewalls/components/FirewallSelectOption.utils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

/**
 * Hook to obtain the information regarding Default Firewalls which can be used for
 * for Default Firewall chips.
 *
 * Determines if the given firewall (via ID) is a default firewall
 * Determines the tooltip and chip text to be used for the chip
 */
export const useDefaultFirewallChipInformation = (
  firewallId: null | number | undefined,
  hideDefaultChips?: boolean
) => {
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { data: firewallSettings } = useFirewallSettingsQuery({
    enabled: isLinodeInterfacesEnabled && !hideDefaultChips,
  });

  const tooltipText =
    firewallId &&
    firewallSettings &&
    getDefaultFirewallDescription(firewallId, firewallSettings);
  const numEntitiesIsDefaultFor =
    firewallSettings && firewallId
      ? getEntitiesThatFirewallIsDefaultFor(firewallId, firewallSettings).length
      : 0;

  const isDefault = !!tooltipText;

  return {
    isDefault,
    numEntitiesIsDefaultFor,
    tooltipText,
  };
};
