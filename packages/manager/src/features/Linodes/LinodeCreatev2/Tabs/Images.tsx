import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';

export const Images = () => {
  const { control, setValue } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'image',
  });

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const regionId = useWatch({ control, name: 'region' });

  const { data: regions } = useRegionsQuery();

  const onChange = (image: Image | null) => {
    field.onChange(image?.id ?? null);

    const selectedRegion = regions?.find((r) => r.id === regionId);

    // Non-"distributed compatible" Images must only be deployed to core sites.
    // Clear the region field if the currently selected region is a distributed site and the Image is only core compatible.
    if (
      image &&
      !image.capabilities.includes('distributed-images') &&
      selectedRegion?.site_type === 'distributed'
    ) {
      setValue('region', '');
    }
  };

  return (
    <Paper>
      <Typography variant="h2">Choose an Image</Typography>
      <ImageSelectv2
        disabled={isCreateLinodeRestricted}
        errorText={fieldState.error?.message}
        onBlur={field.onBlur}
        onChange={onChange}
        value={field.value}
        variant="private"
      />
    </Paper>
  );
};
