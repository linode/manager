import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { SelectRegionPanel } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { defaultInterfaces } from './utilities';

import type { LinodeCreateFormValues } from './utilities';

export const Region = () => {
  const { control, setValue } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'region',
  });

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <SelectRegionPanel
      RegionSelectProps={{
        textFieldProps: {
          onBlur: field.onBlur,
        },
      }}
      handleSelection={(regionId) => {
        field.onChange(regionId);

        // Reset interfaces because VPC and VLANs are region-sepecific
        setValue('interfaces', defaultInterfaces);

        // Reset the placement group because they are region-specific
        setValue('placement_group', undefined);

        // Reset disk encryption because it may not be 
        setValue('disk_encryption', undefined);
      }}
      currentCapability="Linodes"
      disabled={isLinodeCreateRestricted}
      error={fieldState.error?.message}
      selectedId={field.value}
    />
  );
};
