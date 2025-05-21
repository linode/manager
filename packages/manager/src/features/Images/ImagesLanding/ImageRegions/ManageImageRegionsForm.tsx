import { useUpdateImageRegionsMutation } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { ActionsPanel, Notice, Paper, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useFlags } from 'src/hooks/useFlags';

import { useRegionsThatSupportImages } from '../../utils';
import { ImageRegionRow } from './ImageRegionRow';

import type {
  Image,
  ImageRegion,
  Region,
  UpdateImageRegionsPayload,
} from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

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

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const imageRegionIds = image?.regions.map(({ region }) => region) ?? [];

  const { enqueueSnackbar } = useSnackbar();
  const { regions } = useRegionsThatSupportImages();
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
      <Notice spacingTop={16} variant="info">
        <Typography fontSize="inherit">
          As part of our limited promotional period, image replicas are free of
          charge until Q4 2025. Starting in Q4, replicas will be subject to our
          standard monthly rate of &#36;0.10/GB. When replicas become billable,
          your monthly charge will be calculated using the value in the All
          Replicas column.{' '}
          <Link
            to={
              'https://www.linode.com/blog/compute/image-service-improvements-akamai-cdn/'
            }
          >
            Learn more
          </Link>
          .
        </Typography>
      </Notice>
      <RegionMultiSelect
        currentCapability={undefined} // Image's don't have a region capability yet
        disabledRegions={disabledRegions}
        errorText={errors.regions?.message}
        isGeckoLAEnabled={isGeckoLAEnabled}
        label="Add Regions"
        onChange={(regionIds) =>
          setValue('regions', regionIds, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        placeholder="Select regions or type to search"
        regions={regions}
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
                disableRemoveButton={isLastAvailableRegion}
                key={regionId}
                onRemove={() =>
                  setValue(
                    'regions',
                    values.regions.filter((r) => r !== regionId),
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
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
