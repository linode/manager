import { useFirewallSettingsQuery } from '@linode/queries';
import { Box, SelectedIcon, Stack } from '@linode/ui';
import React from 'react';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { DefaultFirewallChip } from './DefaultFirewallChip';
import { getDefaultFirewallDescription } from './FirewallSelectOption.utils';

import type { Firewall } from '@linode/api-v4';
import type { AutocompleteRenderOptionState } from '@mui/material';

interface Props {
  /**
   * Hide the "Default" chip from showing
   * @default false
   */
  hideDefaultChip?: boolean;
  listItemProps: React.HTMLAttributes<HTMLLIElement>;
  option: Firewall;
  state: AutocompleteRenderOptionState;
}

export const FirewallSelectOption = (props: Props) => {
  const { hideDefaultChip, listItemProps, option, state } = props;

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { data: firewallSettings } = useFirewallSettingsQuery({
    enabled: isLinodeInterfacesEnabled && !hideDefaultChip,
  });

  const defaultDescription =
    firewallSettings &&
    getDefaultFirewallDescription(option.id, firewallSettings);

  const isDefault = !!defaultDescription;

  return (
    <li {...listItemProps}>
      <Stack alignItems="center" direction="row" gap={1} sx={{ width: '100%' }}>
        {option.label}
        <Box flexGrow={1} />
        {isDefault && !hideDefaultChip && (
          <DefaultFirewallChip tooltipText={defaultDescription} />
        )}
        {state.selected && <SelectedIcon visible />}
      </Stack>
    </li>
  );
};
