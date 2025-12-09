import { useRegionQuery } from '@linode/queries';
import { Stack, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { VLANSelect } from 'src/components/VLANSelect';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { VLANAvailabilityNotice } from './VLANAvailabilityNotice';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VLAN = ({ index }: Props) => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const { data: permissions } = usePermissions('account', ['create_linode']);

  const regionId = useWatch({ control, name: 'region' });

  const { data: selectedRegion } = useRegionQuery(regionId);

  const regionSupportsVLANs =
    selectedRegion?.capabilities.includes('Vlans') ?? false;

  return (
    <Stack spacing={1.5}>
      {selectedRegion && !regionSupportsVLANs && <VLANAvailabilityNotice />}
      <Stack alignItems="flex-start" direction="row" flexWrap="wrap" gap={2}>
        <Controller
          control={control}
          name={`linodeInterfaces.${index}.vlan.vlan_label`}
          render={({ field, fieldState }) => (
            <VLANSelect
              disabled={!permissions.create_linode || !regionSupportsVLANs}
              errorText={fieldState.error?.message}
              filter={{ region: regionId }}
              helperText={
                !regionId
                  ? 'Select a region to see available VLANs.'
                  : undefined
              }
              onBlur={field.onBlur}
              onChange={field.onChange}
              sx={{ width: 300 }}
              value={field.value ?? null}
            />
          )}
        />
        <Controller
          control={control}
          name={`linodeInterfaces.${index}.vlan.ipam_address`}
          render={({ field, fieldState }) => (
            <TextField
              containerProps={{ maxWidth: 335 }}
              disabled={!permissions.create_linode || !regionSupportsVLANs}
              errorText={fieldState.error?.message}
              label="IPAM Address"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              optional
              placeholder="192.0.2.0/24"
              tooltipText={
                'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
              }
              value={field.value ?? ''}
            />
          )}
        />
      </Stack>
    </Stack>
  );
};
