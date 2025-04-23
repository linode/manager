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

import { INTERFACE_PURPOSE_TO_DEFAULT_FIREWALL_KEY } from './utilities';

import type { CreateInterfaceFormValues } from './utilities';
import type { InterfacePurpose } from '@linode/api-v4';

export const InterfaceType = () => {
  const queryClient = useQueryClient();
  const { setValue } = useFormContext<CreateInterfaceFormValues>();
  const { field, fieldState } = useController<CreateInterfaceFormValues>({
    name: 'purpose',
  });

  const onChange = async (value: InterfacePurpose) => {
    // Change the selected interface type (Public, VPC, VLAN)
    field.onChange(value);

    // Update the form's `firewall_id` based on the defaults
    const firewallSettings = await queryClient.ensureQueryData(
      firewallQueries.settings
    );
    const firewallSettingKey = INTERFACE_PURPOSE_TO_DEFAULT_FIREWALL_KEY[value];
    if (firewallSettingKey) {
      setValue(
        'firewall_id',
        firewallSettings.default_firewall_ids[firewallSettingKey]
      );
    } else {
      setValue('firewall_id', null);
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
