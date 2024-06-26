import { yupResolver } from '@hookform/resolvers/yup';
import { updateImageRegionsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useUpdateImageRegionsMutation } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { ImageRegionRow } from './ImageRegionRow';

import type { Image, UpdateImageRegionsPayload } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  onClose: () => void;
}

export const ManageImageRegionsDrawer = (props: Props) => {
  const { image, onClose } = props;
  const open = image !== undefined;

  const imageRegionIds = useMemo(
    () => image?.regions.map(({ region }) => region) ?? [],
    [image]
  );

  const { enqueueSnackbar } = useSnackbar();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useUpdateImageRegionsMutation(image?.id ?? '');

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<UpdateImageRegionsPayload>({
    defaultValues: { regions: imageRegionIds },
    resolver: yupResolver(updateImageRegionsSchema),
  });

  useEffect(() => {
    if (imageRegionIds) {
      reset({ regions: imageRegionIds });
    }
  }, [imageRegionIds]);

  const onSubmit = async (data: UpdateImageRegionsPayload) => {
    try {
      await mutateAsync(data);

      enqueueSnackbar('Image regions successfully updated.', {
        variant: 'success',
      });

      onClose();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  };

  const values = watch();

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Manage Regions for ${image?.label}`}
    >
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      <Typography>
        Custom images are billed monthly, at $.10/GB. Check out this guide for
        details on managing your Linux system's disk space.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RegionMultiSelect
          onClose={() => {
            setValue('regions', [...selectedRegions, ...values.regions]);
            setSelectedRegions([]);
          }}
          regions={(regions ?? []).filter(
            (r) => !values.regions.includes(r.id)
          )}
          currentCapability="Object Storage"
          errorText={errors.regions?.message}
          label="Add Regions"
          onChange={setSelectedRegions}
          placeholder="Select Regions"
          selectedIds={selectedRegions}
        />
        <Typography sx={{ mb: 1, mt: 2 }}>
          Image will be available in these regions ({values.regions.length})
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            {values.regions.map((regionId) => (
              <ImageRegionRow
                onRemove={() =>
                  setValue(
                    'regions',
                    values.regions.filter((r) => r !== regionId)
                  )
                }
                status={
                  image?.regions.find(
                    (regionItem) => regionItem.region === regionId
                  )?.status ?? 'pending replication'
                }
                key={regionId}
                region={regionId}
              />
            ))}
          </Stack>
        </Paper>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
