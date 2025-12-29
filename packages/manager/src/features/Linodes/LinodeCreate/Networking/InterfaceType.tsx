import { firewallQueries, useQueryClient } from '@linode/queries';
import {
  Box,
  FormControl,
  Radio,
  RadioGroup,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { FormControlLabel, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { useGetLinodeCreateType } from '../Tabs/utils/useGetLinodeCreateType';
import { getDefaultFirewallForInterfacePurpose } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { InterfacePurpose } from '@linode/api-v4';

interface Props {
  index: number;
}

const interfaceTypes = [
  {
    label: 'Public Internet',
    purpose: 'public',
    description:
      'Connects your Linode to the internet, enabling traffic over the public IP address.',
  },
  {
    label: 'VPC',
    purpose: 'vpc',
    description:
      'Connects your Linode to a private, Layer 3 isolated network, allowing secure communication with other Linodes in the same VPC.',
  },
  {
    label: 'VLAN',
    purpose: 'vlan',
    description:
      'Connects your Linode to a private Layer 2 network for local communication with other Linodes.',
  },
] as const;

export const InterfaceType = ({ index }: Props) => {
  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  const { control, getFieldState, setValue } =
    useFormContext<LinodeCreateFormValues>();

  const { field } = useController({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  const interfaceGeneration = useWatch({
    control,
    name: 'interface_generation',
  });

  const createType = useGetLinodeCreateType();
  const isCreatingFromBackup = createType === 'Backups';

  const disabled = isCreatingFromBackup && interfaceGeneration !== 'linode';

  const onChange = async (value: InterfacePurpose) => {
    // Change the interface purpose (Public, VPC, VLAN)
    field.onChange(value);

    // VLAN interfaces do not support Firewalls, so set
    // the Firewall ID to `null` to be safe and early return.
    if (value === 'vlan') {
      setValue(`linodeInterfaces.${index}.firewall_id`, null);
      return;
    }

    // If the user has not touched the Firewall field...
    if (!getFieldState(`linodeInterfaces.${index}.firewall_id`).isTouched) {
      try {
        const firewallSettings = await queryClient.ensureQueryData(
          firewallQueries.settings
        );

        const defaultFirewall = getDefaultFirewallForInterfacePurpose(
          value,
          firewallSettings
        );

        // If this Interface type has a default firewall, set it
        if (defaultFirewall) {
          setValue(`linodeInterfaces.${index}.firewall_id`, defaultFirewall);
        }
        // eslint-disable-next-line sonarjs/no-ignored-exceptions
      } catch (error) {
        // The fetch to get Firewall Settings will fail for restricted users.
        enqueueSnackbar('Unable to retrieve default Firewall.', {
          variant: 'warning',
        });
      }
    }
  };

  return (
    <FormControl>
      <Box alignItems="center" display="flex" flexDirection="row">
        <FormLabel id="network-connection-label">Network Connection</FormLabel>
        {disabled && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              padding: 0,
              marginLeft: '8px',
              marginBottom: '8px',
            }}
            text="You cannot use Configuration Profile Interfaces when deploying to a new Linode from a backup."
          />
        )}
      </Box>
      <RadioGroup
        aria-describedby="network-connection-helper-text"
        aria-labelledby="network-connection-label"
        onChange={(e) => onChange(e.target.value as InterfacePurpose)}
        value={field.value}
      >
        {interfaceTypes.map((interfaceType) => (
          <FormControlLabel
            control={<Radio />}
            data-qa-interface-type-option={interfaceType.purpose}
            disabled={disabled}
            key={interfaceType.purpose}
            label={
              <Stack direction="row" mt={1.25} spacing={0.5}>
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  {interfaceType.label}
                </Typography>
                <TooltipIcon
                  status="info"
                  sxTooltipIcon={{ p: 0, ml: 0.5 }}
                  text={interfaceType.description}
                />
              </Stack>
            }
            sx={{ alignItems: 'flex-start' }}
            value={disabled ? false : interfaceType.purpose}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
