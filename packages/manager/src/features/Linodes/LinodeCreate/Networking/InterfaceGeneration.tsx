import { useAccountSettings } from '@linode/queries';
import {
  BetaChip,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
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
        <FormControl disabled={disabled} sx={{ my: '0px !important', mx: 0.5 }}>
          <RadioGroup
            aria-labelledby="interface-generation"
            onChange={field.onChange}
            sx={{ my: '0px !important' }}
            value={field.value ?? 'legacy_config'}
          >
            <FormControlLabel
              control={<Radio />}
              label={
                <Stack mt={1.25} spacing={0.5}>
                  <Stack direction="row">
                    <Typography sx={(theme) => ({ font: theme.font.bold })}>
                      Linode Interfaces
                    </Typography>
                    <BetaChip />
                  </Stack>
                  <Typography>
                    Linode Interfaces are the preferred option for VPCs and are
                    managed directly through a Linode’s Network settings.
                  </Typography>
                  <Typography>
                    Cloud Firewalls are assigned to individual VPC and public
                    interfaces.
                  </Typography>
                </Stack>
              }
              sx={{ alignItems: 'flex-start' }}
              value="linode"
            />
            <FormControlLabel
              control={<Radio />}
              label={
                <Stack mt={1.25} spacing={0.5}>
                  <Typography sx={(theme) => ({ font: theme.font.bold })}>
                    Configuration Profile Interfaces (Legacy)
                  </Typography>
                  <Typography>
                    Interfaces in the Configuration Profile are part of a
                    Linode’s configuration.
                  </Typography>
                  <Typography>
                    Cloud Firewalls are applied at the Linode level and
                    automatically cover all non-VLAN interfaces in the
                    Configuration Profile.
                  </Typography>
                </Stack>
              }
              sx={{ alignItems: 'flex-start' }}
              value="legacy_config"
            />
          </RadioGroup>
        </FormControl>
      </ShowMoreExpansion>
    </Box>
  );
};
