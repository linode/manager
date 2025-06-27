import { Stack, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { VLANSelect } from 'src/components/VLANSelect';

import type { CreateInterfaceFormValues } from '../utilities';

interface Props {
  regionId: string;
}

export const VLANInterface = ({ regionId }: Props) => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  return (
    <Stack spacing={2}>
      <Controller
        control={control}
        name="vlan.vlan_label"
        render={({ field, fieldState }) => (
          <VLANSelect
            errorText={fieldState.error?.message}
            filter={{ region: regionId }}
            onChange={field.onChange}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="vlan.ipam_address"
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            helperText="IPAM address must use IP/netmask format, e.g. 192.0.2.0/24."
            label="IPAM Address"
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            optional
            placeholder="192.0.2.0/24"
            value={field.value ?? ''}
          />
        )}
      />
    </Stack>
  );
};
