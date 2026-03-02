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
import { FormLabel } from '@mui/material';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { LinodeInterfaceFeatureStatusChip } from '../../LinodesDetail/LinodeNetworking/LinodeInterfaces/LinodeInterfaceFeatureChip';

import type { LinodeCreateFormValues } from '../utilities';
import type {
  CreateLinodeRequest,
  LinodeInterfaceAccountSetting,
} from '@linode/api-v4';

const disabledReasonMap: Partial<
  Record<LinodeInterfaceAccountSetting, string>
> = {
  legacy_config_only:
    'Your account administrator has enforced that all new Linodes are created with legacy configuration interfaces.',
  linode_only:
    'Your account administrator has enforced that all new Linodes are created with Linode interfaces.',
};

export const InterfaceGeneration = () => {
  const { setValue } = useFormContext<CreateLinodeRequest>();

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
    <FormControl>
      <Box alignItems="center" display="flex" flexDirection="row">
        <FormLabel id="network-interface-label">
          Network Interface Type
        </FormLabel>
        {disabled && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              padding: 0,
              marginLeft: '8px',
              marginBottom: '8px',
            }}
            text={disabledReason}
          />
        )}
      </Box>
      <RadioGroup
        aria-labelledby="interface-generation"
        onChange={(e, value) => {
          field.onChange(e);

          // If Linode Interfaces is selected, unset private IP because it's not compatible.
          if (value === 'linode') {
            setValue('private_ip', undefined);
          }
        }}
        value={field.value ?? 'linode'}
      >
        <FormControlLabel
          control={<Radio />}
          data-qa-interfaces-option="linode"
          disabled={disabled}
          label={
            <Stack mt={1.25} spacing={0.5}>
              <Stack direction="row">
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  Linode Interfaces (Recommended)
                </Typography>
                <LinodeInterfaceFeatureStatusChip />
                <TooltipIcon
                  status="info"
                  sxTooltipIcon={{
                    p: 0,
                    ml: 0.5,
                  }}
                  text={
                    <Stack spacing={2}>
                      <Typography>
                        For VPC or public networking setups and when private IPs
                        are not required.
                      </Typography>
                      <Typography>
                        Linode Interfaces are directly associated with the
                        compute instance for easier visibility and management.
                      </Typography>
                      <Typography>
                        Different Cloud Firewalls can be assigned to each VPC
                        and public interface.
                      </Typography>
                    </Stack>
                  }
                  tooltipPosition="right"
                  width={280}
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
          disabled={disabled}
          label={
            <Stack direction="row" mt={1.25} spacing={0.5}>
              <Typography sx={(theme) => ({ font: theme.font.bold })}>
                Configuration Profile Interfaces (Legacy)
              </Typography>
              <TooltipIcon
                status="info"
                sxTooltipIcon={{
                  p: 0,
                  ml: 0.5,
                }}
                text={
                  <Stack spacing={2}>
                    <Typography>For Linodes requiring a private IP.</Typography>
                    <Typography>
                      Configuration Profile Interfaces are a part of the
                      configuration profile.
                    </Typography>
                    <Typography>
                      The same Cloud Firewall is assigned to all non-VLAN
                      interfaces on the Linode.
                    </Typography>
                  </Stack>
                }
                tooltipPosition="right"
                width={280}
              />
            </Stack>
          }
          sx={{ alignItems: 'flex-start' }}
          value="legacy_config"
        />
      </RadioGroup>
    </FormControl>
  );
};
