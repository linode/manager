import { useSnackbar } from 'notistack';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useUpdateImageRegionsMutation } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { ImageRegionRow } from './ImageRegionRow';

import type {
  Image,
  ImageRegion,
  UpdateImageRegionsPayload,
} from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

interface Props {
  image: Image | undefined;
  onClose: () => void;
}

export const ManageImageRegionsForm = (props: Props) => {
  const { image, onClose } = props;

  const imageRegionIds = image?.regions.map(({ region }) => region) ?? [];

  const { enqueueSnackbar } = useSnackbar();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useUpdateImageRegionsMutation(image?.id ?? '');

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
    setValue,
    watch,
  } = useForm<UpdateImageRegionsPayload, ImageRegion[]>({
    context: image?.regions,
    defaultValues: { regions: imageRegionIds },
    resolver,
    values: { regions: imageRegionIds },
  });

  const onSubmit = async (data: UpdateImageRegionsPayload) => {
    try {
      await mutateAsync(data);

      enqueueSnackbar(
        `${image?.label ?? 'Image'}'s regions successfully updated.`,
        {
          variant: 'success',
        }
      );

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
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      <Typography>
        Custom images are billed monthly, at $.10/GB. Check out{' '}
        <Link to="https://www.linode.com/docs/guides/check-and-clean-linux-disk-space/">
          this guide
        </Link>{' '}
        for details on managing your Linux system's disk space.
      </Typography>
      <RegionMultiSelect
        onChange={(regionIds) =>
          setValue('regions', regionIds, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        currentCapability={undefined}
        errorText={errors.regions?.message}
        label="Add Regions"
        placeholder="Select regions or type to search"
        regions={regions?.filter((r) => r.site_type === 'core') ?? []}
        renderTags={() => null}
        selectedIds={values.regions}
      />
      <Typography sx={{ mb: 1, mt: 2 }}>
        Image will be available in these regions ({values.regions.length})
      </Typography>
      <Paper
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          p: 2,
          py: 1,
        })}
        variant="outlined"
      >
        <Stack spacing={1}>
          {values.regions.length === 0 && (
            <Typography py={1} textAlign="center">
              No Regions Selected
            </Typography>
          )}
          {values.regions.map((regionId) => {
            const status =
              image?.regions.find(
                (regionItem) => regionItem.region === regionId
              )?.status ?? 'unsaved';

            const isLastAvailableRegion =
              status === 'available' &&
              image?.regions
                .filter((r) => values.regions.includes(r.region))
                .filter((r) => r.status === 'available').length === 1;

            return (
              <ImageRegionRow
                onRemove={() =>
                  setValue(
                    'regions',
                    values.regions.filter((r) => r !== regionId),
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
                disableRemoveButton={isLastAvailableRegion}
                key={regionId}
                region={regionId}
                status={status}
              />
            );
          })}
        </Stack>
      </Paper>
      <ActionsPanel
        primaryButtonProps={{
          disabled: !isDirty,
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
  );
};

const resolver: Resolver<UpdateImageRegionsPayload, ImageRegion[]> = async (
  values,
  context
) => {
  const availableRegionIds = context
    ?.filter((r) => r.status === 'available')
    .map((r) => r.region);

  const isMissingAvailableRegion = !values.regions.some((regionId) =>
    availableRegionIds?.includes(regionId)
  );

  if (isMissingAvailableRegion) {
    const message = `You must specify at least one available region (${availableRegionIds?.join(
      ', '
    )}).`;
    return { errors: { regions: { message, type: 'validate' } }, values };
  }

  return { errors: {}, values };
};
