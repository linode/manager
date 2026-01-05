import { useAccountSettings } from '@linode/queries';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';

import { LinodeInterfaceFeatureStatusChip } from '../../LinodesDetail/LinodeNetworking/LinodeInterfaces/LinodeInterfaceFeatureChip';

import type { LinodeCreateFormValues } from '../utilities';
import type { LinodeInterfaceAccountSetting } from '@linode/api-v4';

const disabledReasonMap: Partial<
  Record<LinodeInterfaceAccountSetting, string>
> = {
  legacy_config_only:
    'Your account administrator has enforced that all new Linodes are created with legacy configuration interfaces.',
  linode_only:
    'Your account administrator has enforced that all new Linodes are created with Linode interfaces.',
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
        <FormControl
          disabled={disabled}
          sx={{ mt: '0px !important', mb: 2, mx: 0.5 }}
        >
          <RadioGroup
            aria-labelledby="interface-generation"
            onChange={field.onChange}
            sx={{ my: '0px !important' }}
            value={field.value ?? 'legacy_config'}
          >
            <FormControlLabel
              control={<Radio />}
              data-qa-interfaces-option="linode"
              label={
                <Stack mt={1.25} spacing={0.5}>
                  <Stack direction="row">
                    <Typography sx={(theme) => ({ font: theme.font.bold })}>
                      Linode Interfaces
                    </Typography>
                    <LinodeInterfaceFeatureStatusChip />
                    <TooltipIcon
                      status="info"
                      sxTooltipIcon={{ p: 0, ml: 0.5 }}
                      text={
                        <>
                          Managed directly through a Linode&apos;s Network
                          settings. This is the recommended option.
                          <br />
                          <br />
                          Cloud Firewalls are assigned to individual VPC and
                          public interfaces.
                        </>
                      }
                    />
                  </Stack>
                </Stack>
              }
              sx={{ alignItems: 'flex-start' }}
              value="linode"
            />
            <FormControlLabel
              control={<Radio />}
              data-qa-interfaces-option="legacy_config"
              label={
                <Stack direction="row" mt={1.25} spacing={0.5}>
                  <Typography sx={(theme) => ({ font: theme.font.bold })}>
                    Configuration Profile Interfaces (Legacy)
                  </Typography>
                  <TooltipIcon
                    status="info"
                    sxTooltipIcon={{ p: 0, ml: 0.5 }}
                    text={
                      <>
                        Interfaces are part of the Linode&apos;s Configuration
                        Profile.
                        <br />
                        <br />
                        Cloud Firewalls are applied at the Linode level and
                        automatically cover all non-VLAN interfaces in the
                        Configuration Profile.
                      </>
                    }
                  />
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
