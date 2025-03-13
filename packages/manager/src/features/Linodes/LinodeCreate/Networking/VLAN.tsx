import { useRegionQuery } from '@linode/queries';
import { Stack, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { VLANSelect } from 'src/components/VLANSelect';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VLAN = ({ index }: Props) => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const regionId = useWatch({ control, name: 'region' });

  const { data: selectedRegion } = useRegionQuery(regionId);

  const regionSupportsVLANs =
    selectedRegion?.capabilities.includes('Vlans') ?? false;

  return (
    <Stack
      alignItems="flex-start"
      columnGap={2}
      direction="row"
      flexWrap="wrap"
    >
      <Controller
        render={({ field, fieldState }) => (
          <VLANSelect
            helperText={
              !regionId
                ? 'Select a region to see available VLANs.'
                : selectedRegion && !regionSupportsVLANs
                ? 'VLAN is not available in the selected region.'
                : undefined
            }
            disabled={isLinodeCreateRestricted || !regionSupportsVLANs}
            errorText={fieldState.error?.message}
            filter={{ region: regionId }}
            onBlur={field.onBlur}
            onChange={field.onChange}
            sx={{ width: 300 }}
            value={field.value ?? null}
          />
        )}
        control={control}
        name={`linodeInterfaces.${index}.vlan.vlan_label`}
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            tooltipText={
              'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
            }
            containerProps={{ maxWidth: 335 }}
            disabled={isLinodeCreateRestricted}
            errorText={fieldState.error?.message}
            label="IPAM Address"
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            optional
            placeholder="192.0.2.0/24"
            value={field.value ?? ''}
          />
        )}
        control={control}
        name={`linodeInterfaces.${index}.vlan.ipam_address`}
      />
    </Stack>
  );
};
