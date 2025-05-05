import { Box, SelectedIcon, Stack } from '@linode/ui';
import React from 'react';

import { useDefaultFirewallChipInformation } from 'src/hooks/useDefaultFirewallChipInformation';

import { DefaultFirewallChip } from './DefaultFirewallChip';

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

  const { defaultNumEntities, isDefault, tooltipText } =
    useDefaultFirewallChipInformation(option.id);

  return (
    <li {...listItemProps}>
      <Stack alignItems="center" direction="row" gap={1} sx={{ width: '100%' }}>
        {option.label}
        <Box flexGrow={1} />
        {isDefault && !hideDefaultChip && (
          <DefaultFirewallChip
            defaultNumEntities={defaultNumEntities}
            tooltipText={tooltipText}
          />
        )}
        {state.selected && <SelectedIcon />}
      </Stack>
    </li>
  );
};
