import { yupResolver } from '@hookform/resolvers/yup';
import { createImageSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { DISK_ENCRYPTION_IMAGES_CAVEAT_COPY } from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useCreateImageMutation } from 'src/queries/images';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { CreateImagePayload } from '@linode/api-v4';
import type { LinodeConfigAndDiskQueryParams } from 'src/features/Linodes/types';

export const CreateImageTab = () => {
  const location = useLocation();

  const queryParams = React.useMemo(
    () =>
      getQueryParamsFromQueryString<LinodeConfigAndDiskQueryParams>(
        location.search
      ),
    [location.search]
  );

  const {
    control,
    formState,
    handleSubmit,
    resetField,
    setError,
    setValue,
    watch,
  } = useForm<CreateImagePayload>({
    defaultValues: {
      disk_id: +queryParams.selectedDisk,
    },
    mode: 'onBlur',
    resolver: yupResolver(createImageSchema),
  });

  const flags = useFlags();

  const { enqueueSnackbar } = useSnackbar();
  const { push } = useHistory();

  const { mutateAsync: createImage } = useCreateImageMutation();

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: grants } = useGrants();

  const isImageCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_images',
  });

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createImage(values);

      checkForNewEvents();

      enqueueSnackbar('Image scheduled for creation.', {
        variant: 'info',
      });
      push('/images');
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  const [selectedLinodeId, setSelectedLinodeId] = React.useState<null | number>(
    queryParams.selectedLinode ? +queryParams.selectedLinode : null
  );

  const { data: selectedLinode } = useLinodeQuery(
    selectedLinodeId ?? -1,
    selectedLinodeId !== null
  );

  const {
    data: disks,
    error: disksError,
    isFetching: disksLoading,
  } = useAllLinodeDisksQuery(selectedLinodeId ?? -1, selectedLinodeId !== null);

  const selectedDiskId = watch('disk_id');
  const selectedDisk =
    disks?.find((disk) => disk.id === selectedDiskId) ?? null;

  React.useEffect(() => {
    if (formState.touchedFields.label) {
      return;
    }
    if (selectedLinode) {
      setValue('label', `${selectedLinode.label}-${selectedDisk?.label ?? ''}`);
    } else {
      resetField('label');
    }
  }, [
    selectedLinode,
    selectedDisk,
    formState.touchedFields.label,
    setValue,
    resetField,
  ]);

  const isRawDisk = selectedDisk?.filesystem === 'raw';

  const { data: regions } = useRegionsQuery();

  const selectedLinodeRegion = regions?.find(
    (r) => r.id === selectedLinode?.region
  );

  const linodeIsInDistributedRegion =
    selectedLinodeRegion?.site_type === 'distributed';

  /**
   * The 'Object Storage' capability indicates a region can store images
   */
  const linodeRegionSupportsImageStorage = selectedLinodeRegion?.capabilities.includes(
    'Object Storage'
  );

  /*
    We only want to display the notice about disk encryption if:
    1. the Disk Encryption feature is enabled
    2. a linode is selected
    2. the selected linode is not in an Edge region
  */
  const showDiskEncryptionWarning =
    isDiskEncryptionFeatureEnabled &&
    selectedLinodeId !== null &&
    !linodeIsInDistributedRegion;

  const linodeSelectHelperText = grants?.linode.some(
    (grant) => grant.permissions === 'read_only'
  )
    ? 'You can only create Images from Linodes you have read/write access to.'
    : undefined;

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        {isImageCreateRestricted && (
          <Notice
            text={getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Images',
            })}
            important
            variant="error"
          />
        )}
        <Paper>
          {formState.errors.root?.message && (
            <Notice
              spacingBottom={8}
              text={formState.errors.root.message}
              variant="error"
            />
          )}
          <Stack spacing={2}>
            <Typography variant="h2">Select Linode & Disk</Typography>
            <Typography sx={{ maxWidth: { md: '80%', sm: '100%' } }}>
              Custom images are billed monthly at $0.10/GB. The disk you target
              for an image needs to meet specific{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image">
                requirements
              </Link>
              .
            </Typography>

            <LinodeSelect
              getOptionDisabled={
                grants
                  ? (linode) =>
                      grants.linode.some(
                        (grant) =>
                          grant.id === linode.id &&
                          grant.permissions === 'read_only'
                      )
                  : undefined
              }
              onSelectionChange={(linode) => {
                setSelectedLinodeId(linode?.id ?? null);
                if (linode === null) {
                  resetField('disk_id');
                }
              }}
              disabled={isImageCreateRestricted}
              helperText={linodeSelectHelperText}
              noMarginTop
              required
              value={selectedLinodeId}
            />
            {selectedLinode &&
              !linodeRegionSupportsImageStorage &&
              flags.imageServiceGen2 &&
              flags.imageServiceGen2Ga && (
                <Notice variant="warning">
                  This Linode’s region doesn’t support local image storage. This
                  image will be stored in the core compute region that’s{' '}
                  <Link to="https://techdocs.akamai.com/cloud-computing/docs/images#regions-and-captured-custom-images">
                    geographically closest
                  </Link>
                  . After it’s stored, you can replicate it to other{' '}
                  <Link to="https://www.linode.com/global-infrastructure/">
                    core compute regions
                  </Link>
                  .
                </Notice>
              )}
            {linodeIsInDistributedRegion && !flags.imageServiceGen2Ga && (
              <Notice variant="warning">
                This Linode is in a distributed compute region. These regions
                can't store images. The image is stored in the core compute
                region that is{' '}
                <Link to="https://www.linode.com/global-infrastructure/">
                  geographically closest
                </Link>
                . After it's stored, you can replicate it to other core compute
                regions.
              </Notice>
            )}
            {showDiskEncryptionWarning && (
              <Notice variant="warning">
                <Typography sx={(theme) => ({ fontFamily: theme.font.normal })}>
                  {DISK_ENCRYPTION_IMAGES_CAVEAT_COPY}
                </Typography>
              </Notice>
            )}
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  disabled={
                    isImageCreateRestricted || selectedLinodeId === null
                  }
                  errorText={
                    fieldState.error?.message ?? disksError?.[0].reason
                  }
                  helperText={
                    selectedLinodeId === null
                      ? 'Select a Linode to see available disks'
                      : undefined
                  }
                  textFieldProps={{
                    inputRef: field.ref,
                  }}
                  clearOnBlur
                  label="Disk"
                  loading={disksLoading}
                  noMarginTop
                  onBlur={field.onBlur}
                  onChange={(e, disk) => field.onChange(disk?.id ?? null)}
                  options={disks?.filter((d) => d.filesystem !== 'swap') ?? []}
                  placeholder="Select a Disk"
                  value={selectedDisk}
                />
              )}
              control={control}
              name="disk_id"
            />
            {isRawDisk && (
              <Notice
                spacingBottom={32}
                spacingTop={16}
                text="Using a raw disk may fail, as Linode Images cannot be created from disks formatted with custom filesystems."
                variant="warning"
              />
            )}
          </Stack>
        </Paper>
        <Paper>
          <Stack spacing={2}>
            <Typography variant="h2">Image Details</Typography>
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : e.target.value
                    )
                  }
                  disabled={isImageCreateRestricted}
                  errorText={fieldState.error?.message}
                  inputRef={field.ref}
                  label="Label"
                  noMarginTop
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                />
              )}
              control={control}
              name="label"
            />
            {flags.metadata && (
              <Controller
                render={({ field }) => (
                  <Checkbox
                    text={
                      <>
                        This image is cloud-init compatible
                        <TooltipIcon
                          text={
                            <Typography>
                              Many Linode supported operating systems are
                              compatible with cloud-init by default, or you may
                              have installed cloud-init.{' '}
                              <Link to="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service">
                                Learn more.
                              </Link>
                            </Typography>
                          }
                          status="help"
                        />
                      </>
                    }
                    checked={field.value ?? false}
                    disabled={isImageCreateRestricted}
                    onChange={field.onChange}
                    sx={{ ml: -1 }}
                  />
                )}
                control={control}
                name="cloud_init"
              />
            )}
            <Controller
              render={({ field, fieldState }) => (
                <TagsInput
                  onChange={(items) =>
                    field.onChange(items.map((item) => item.value))
                  }
                  value={
                    field.value?.map((tag) => ({ label: tag, value: tag })) ??
                    []
                  }
                  disabled={isImageCreateRestricted}
                  noMarginTop
                  tagError={fieldState.error?.message}
                />
              )}
              control={control}
              name="tags"
            />
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : e.target.value
                    )
                  }
                  disabled={isImageCreateRestricted}
                  errorText={fieldState.error?.message}
                  inputRef={field.ref}
                  label="Description"
                  multiline
                  noMarginTop
                  onBlur={field.onBlur}
                  rows={1}
                  value={field.value ?? ''}
                />
              )}
              control={control}
              name="description"
            />
          </Stack>
        </Paper>
        <Box
          alignItems="center"
          display="flex"
          flexWrap="wrap"
          justifyContent="flex-end"
        >
          <Button
            buttonType="primary"
            disabled={isImageCreateRestricted}
            loading={formState.isSubmitting}
            type="submit"
          >
            Create Image
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
