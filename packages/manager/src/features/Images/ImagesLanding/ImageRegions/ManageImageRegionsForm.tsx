import { Notice, Paper, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Link } from 'src/components/Link';
import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useUpdateImageRegionsMutation } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { ImageRegionRow } from './ImageRegionRow';

import type {
  Image,
  ImageRegion,
  Region,
  UpdateImageRegionsPayload,
} from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';
import type { DisableItemOption } from 'src/components/ListItemOption';

interface Props {
  image: Image | undefined;
  onClose: () => void;
}
interface Context {
  imageRegions: ImageRegion[] | undefined;
  regions: Region[] | undefined;
}

export const ManageImageReplicasForm = (props: Props) => {
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
  } = useForm<UpdateImageRegionsPayload, Context>({
    context: { imageRegions: image?.regions, regions },
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

  const disabledRegions: Record<string, DisableItemOption> = {};

  const availableRegions = image?.regions.filter(
    (regionItem) => regionItem.status === 'available'
  );
  const availableRegionIds = availableRegions?.map((r) => r.region);

  const currentlySelectedAvailableRegions = values.regions.filter((r) =>
    availableRegionIds?.includes(r)
  );

  if (currentlySelectedAvailableRegions.length === 1) {
    disabledRegions[currentlySelectedAvailableRegions[0]] = {
      reason:
        'You cannot remove this region because at least one available region must be present.',
    };
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      <Typography>
        Custom images are billed monthly at $0.10/GB. Check out{' '}
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
        currentCapability="Object Storage" // Images use Object Storage as the storage backend
        disabledRegions={disabledRegions}
        errorText={errors.regions?.message}
        ignoreAccountAvailability // Ignore the account capability because we are just using "Object Storage" for region compatibility
        label="Add Regions"
        placeholder="Select regions or type to search"
        regions={regions?.filter((r) => r.site_type === 'core') ?? []}
        renderTags={() => null}
        selectedIds={values.regions}
      />
      <Typography sx={{ mb: 1, mt: 2 }}>
        Image will be replicated in these regions ({values.regions.length})
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

const resolver: Resolver<UpdateImageRegionsPayload, Context> = async (
  values,
  context
) => {
  const availableRegionIds = context?.imageRegions
    ?.filter((r) => r.status === 'available')
    .map((r) => r.region);

  const isMissingAvailableRegion = !values.regions.some((regionId) =>
    availableRegionIds?.includes(regionId)
  );

  const availableRegionLabels = context?.regions
    ?.filter((r) => availableRegionIds?.includes(r.id))
    .map((r) => r.label);

  if (isMissingAvailableRegion) {
    const message = `At least one available region must be present (${availableRegionLabels?.join(
      ', '
    )}).`;
    return { errors: { regions: { message, type: 'validate' } }, values };
  }

  return { errors: {}, values };
};
