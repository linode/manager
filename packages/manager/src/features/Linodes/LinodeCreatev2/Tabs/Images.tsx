import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import DistributedRegionIcon from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Box } from 'src/components/Box';
import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { getAPIFilterForImageSelect } from 'src/components/ImageSelectv2/utilities';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAllImagesQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { getGeneratedLinodeLabel, type LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';

export const Images = () => {
  const { control, formState: { dirtyFields: { label: isLabelFieldDirty }}, getValues, setValue } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'image',
  });
  const queryClient = useQueryClient();

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const regionId = useWatch({ control, name: 'region' });

  const { data: regions } = useRegionsQuery();

  const onChange = async (image: Image | null) => {
    field.onChange(image?.id ?? null);

    const selectedRegion = regions?.find((r) => r.id === regionId);

    // Non-"distributed compatible" Images must only be deployed to core sites.
    // Clear the region field if the currently selected region is a distributed site and the Image is only core compatible.
    // @todo: delete this logic when all Images are "distributed compatible"
    if (
      image &&
      !image.capabilities.includes('distributed-images') &&
      selectedRegion?.site_type === 'distributed'
    ) {
      setValue('region', '');
    }

    if (!isLabelFieldDirty) {
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: "Images",
        values: getValues(),
      });
      setValue('label', label);
    }
  };

  const { data: images } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect('private')
  );

  // @todo: delete this logic when all Images are "distributed compatible"
  const showDistributedCapabilityNotice = images?.some((image) =>
    image.capabilities.includes('distributed-images')
  );

  return (
    <Paper>
      <Typography variant="h2">Choose an Image</Typography>
      <Box alignItems="flex-end" display="flex" flexWrap="wrap" gap={2}>
        <ImageSelectv2
          disabled={isCreateLinodeRestricted}
          errorText={fieldState.error?.message}
          onBlur={field.onBlur}
          onChange={onChange}
          sx={{ width: '416px' }}
          value={field.value}
          variant="private"
        />
        {showDistributedCapabilityNotice && (
          <Stack alignItems="center" direction="row" pb={0.8} spacing={1}>
            <DistributedRegionIcon height="21px" width="24px" />
            <Typography>
              Indicates compatibility with distributed compute regions.
            </Typography>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};
