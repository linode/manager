import { useAccountSettings } from '@linode/queries';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';

import type { LinodeCreateFormValues } from '../utilities';
import type { LinodeInterfaceAccountSetting } from '@linode/api-v4';

const disabledReasonMap: Partial<
  Record<LinodeInterfaceAccountSetting, string>
> = {
  legacy_config_only:
    'You account administrator has enforced that all new Linodes are created with legacy configuration interfaces.',
  linode_only:
    'You account administrator has enforced that all new Linodes are created with Linode interfaces.',
};

export const InterfaceGeneration = () => {
  const { field } = useController<
    LinodeCreateFormValues,
    'interface_generation'
  >({
    name: 'interface_generation',
  });

  const { data: accountSettings } = useAccountSettings();

  const disabledReason =
    accountSettings &&
    disabledReasonMap[accountSettings.interfaces_for_new_linodes];

  const disabled = disabledReason !== undefined;

  return (
    <Box>
      <ShowMoreExpansion
        ButtonProps={{
          TooltipProps: {
            placement: 'right',
          },
          alwaysShowTooltip: disabled,
          tooltipText: disabledReason,
        }}
        defaultExpanded={!disabled}
        name="Network Interface Type"
      >
        <FormControl disabled={disabled} sx={{ my: '0px !important' }}>
          <RadioGroup
            aria-labelledby="interface-generation"
            onChange={field.onChange}
            sx={{ my: '0px !important' }}
            value={field.value ?? 'legacy_config'}
          >
            <FormControlLabel
              control={<Radio />}
              label="Configuration Profile Interfaces (Legacy)"
              value="legacy_config"
            />
            <FormControlLabel
              control={<Radio />}
              label="Linode Interfaces (New)"
              value="linode"
            />
          </RadioGroup>
        </FormControl>
      </ShowMoreExpansion>
    </Box>
  );
};
