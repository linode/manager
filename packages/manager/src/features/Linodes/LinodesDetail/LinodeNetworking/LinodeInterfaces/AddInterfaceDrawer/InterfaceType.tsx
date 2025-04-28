import { firewallQueries } from '@linode/queries';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { getDefaultFirewallForInterfacePurpose } from 'src/features/Linodes/LinodeCreate/Networking/utilities';

import type { CreateInterfaceFormValues } from './utilities';
import type { InterfacePurpose } from '@linode/api-v4';

export const InterfaceType = () => {
  const queryClient = useQueryClient();

  const { setValue, getFieldState } =
    useFormContext<CreateInterfaceFormValues>();

  const { field, fieldState } = useController<CreateInterfaceFormValues>({
    name: 'purpose',
  });

  const onChange = async (value: InterfacePurpose) => {
    // Change the interface purpose (Public, VPC, VLAN)
    field.onChange(value);

    // VLAN interfaces do not support Firewalls, so set
    // the Firewall ID to `null` to be safe and early return.
    if (value === 'vlan') {
      setValue('firewall_id', null);
      return;
    }

    // If the user has not touched the Firewall field...
    if (!getFieldState('firewall_id').isTouched) {
      const firewallSettings = await queryClient.ensureQueryData(
        firewallQueries.settings
      );

      const defaultFirewall = getDefaultFirewallForInterfacePurpose(
        value,
        firewallSettings
      );

      // If this Interface type has a default firewall, set it
      if (defaultFirewall) {
        setValue('firewall_id', defaultFirewall);
      }
    }
  };

  return (
    <FormControl error={Boolean(fieldState.error)} sx={{ marginTop: 0 }}>
      <RadioGroup
        aria-describedby="interface-type-error"
        onChange={(e, value) => onChange(value as InterfacePurpose)}
        sx={{ my: `0 !important` }}
        value={field.value ?? null}
      >
        <FormControlLabel control={<Radio />} label="Public" value="public" />
        <FormControlLabel control={<Radio />} label="VPC" value="vpc" />
        <FormControlLabel control={<Radio />} label="VLAN" value="vlan" />
      </RadioGroup>
      {fieldState.error && (
        <FormHelperText
          sx={(theme) => ({
            color: `${theme.palette.error.dark} !important`,
            m: 0,
          })}
          id="interface-type-error"
        >
          {fieldState.error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
};
