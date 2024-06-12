import { yupResolver } from '@hookform/resolvers/yup';
import { CreateImagePayload } from '@linode/api-v4';
import { createImageSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { DISK_ENCRYPTION_IMAGES_CAVEAT_COPY } from 'src/components/DiskEncryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { Stack } from 'src/components/Stack';
import { SupportLink } from 'src/components/SupportLink';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useCreateImageMutation } from 'src/queries/images';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';

export const CreateImageTab = () => {
  const [selectedLinodeId, setSelectedLinodeId] = React.useState<null | number>(
    null
  );

  const {
    control,
    formState,
    handleSubmit,
    resetField,
    setError,
    watch,
  } = useForm<CreateImagePayload>({
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

  const {
    data: disks,
    error: disksError,
    isFetching: disksLoading,
  } = useAllLinodeDisksQuery(selectedLinodeId ?? -1, selectedLinodeId !== null);

  const selectedDiskId = watch('disk_id');
  const selectedDisk =
    disks?.find((disk) => disk.id === selectedDiskId) ?? null;

  const isRawDisk = selectedDisk?.filesystem === 'raw';

  const { data: regionsData } = useRegionsQuery();

  const { data: linode } = useLinodeQuery(
    selectedLinodeId ?? -1,
    selectedLinodeId !== null
  );

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regionsData ?? [],
    linode?.region ?? ''
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
        <Paper>
          {isImageCreateRestricted && (
            <Notice
              text="You don't have permissions to create a new Image. Please contact an account administrator for details."
              variant="error"
            />
          )}
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
              By default, Linode images are limited to 6144 MB of data per disk.
              Ensure your content doesn&rsquo;t exceed this limit, or{' '}
              <SupportLink
                entity={
                  selectedLinodeId !== null
                    ? { id: selectedLinodeId, type: 'linode_id' }
                    : undefined
                }
                text="open a support ticket"
                title="Request to increase Image size limit when capturing from Linode disk"
              />{' '}
              to request a higher limit. Additionally, images can&rsquo;t be
              created from a raw disk or a disk that&rsquo;s formatted using a
              custom file system.
            </Typography>
            {linodeIsInDistributedRegion && (
              <Notice variant="info">
                This Linode is in a distributed compute region. Images captured
                from this Linode will be stored in the closest core site.
              </Notice>
            )}
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
                              Many Linode supported distributions are compatible
                              with cloud-init by default, or you may have
                              installed cloud-init.{' '}
                              <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
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
            <Typography
              sx={{ maxWidth: { md: '80%', sm: '100%' } }}
              variant="body1"
            >
              Custom Images are billed at $0.10/GB per month.{' '}
              <Link to="https://www.linode.com/docs/products/tools/images/guides/capture-an-image/">
                Learn more about requirements and considerations.{' '}
              </Link>
              For information about how to check and clean a Linux
              system&rsquo;s disk space,{' '}
              <Link to="https://www.linode.com/docs/guides/check-and-clean-linux-disk-space/">
                read this guide.
              </Link>
            </Typography>
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
