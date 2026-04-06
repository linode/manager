import { useAllImagesQuery, useRegionsQuery } from '@linode/queries';
import { Box, Paper, Stack, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS } from 'src/components/ImageSelect/constants';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { ImageSelectTable } from 'src/components/ImageSelect/ImageSelectTable';
import { getAPIFilterForImageSelect } from 'src/components/ImageSelect/utilities';
import { Link } from 'src/components/Link';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsPrivateImageSharingEnabled } from 'src/features/Images/utils';

import { Region } from '../Region';
import { getGeneratedLinodeLabel } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';

export const Images = () => {
  const {
    control,
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController({
    control,
    name: 'image',
  });

  const queryClient = useQueryClient();

  const { data: permissions } = usePermissions('account', ['create_linode']);

  const regionId = useWatch({ control, name: 'region' });

  const { data: regions } = useRegionsQuery();

  const selectedRegion = regions?.find((r) => r.id === regionId);

  const { isPrivateImageSharingEnabled } = useIsPrivateImageSharingEnabled();

  const onChange = async (image: Image | null) => {
    field.onChange(image?.id ?? null);

    // Non-"distributed compatible" Images must only be deployed to core sites.
    // Clear the region field if the currently selected region is a distributed site and the Image is only core compatible.
    // @todo: delete this logic when all Images are "distributed compatible"
    if (
      image &&
      !image.capabilities.includes('distributed-sites') &&
      selectedRegion?.site_type === 'distributed'
    ) {
      setValue('region', '');
    }

    if (!isLabelFieldDirty) {
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: 'Images',
        values: getValues(),
      });
      setValue('label', label);
    }
  };

  const { data: images } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect('private')
  );

  if (images?.length === 0) {
    return (
      <Paper>
        <Placeholder icon={ComputeIcon} isEntity title="My Images">
          <Typography variant="subtitle1">
            You don&rsquo;t have any private Images. Visit the{' '}
            <Link to="/images">Images section</Link> to create an Image from one
            of your Linode&rsquo;s disks.
          </Typography>
        </Placeholder>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Region />
      <Paper>
        <Typography variant="h2">Choose an Image</Typography>
        {isPrivateImageSharingEnabled ? (
          <ImageSelectTable
            currentRoute="/linodes/create/images"
            errorText={fieldState.error?.message}
            onSelect={onChange}
            pendoIDs={IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS}
            selectedImageId={field.value}
          />
        ) : (
          <Box alignItems="flex-end" display="flex" flexWrap="wrap" gap={2}>
            <ImageSelect
              disabled={!permissions.create_linode}
              errorText={fieldState.error?.message}
              onBlur={field.onBlur}
              onChange={onChange}
              siteType={selectedRegion?.site_type}
              value={field.value ?? null}
              variant="private"
            />
          </Box>
        )}
      </Paper>
    </Stack>
  );
};
