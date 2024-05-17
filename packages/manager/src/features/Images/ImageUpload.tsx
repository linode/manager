import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { LinodeCLIModal } from 'src/components/LinodeCLIModal/LinodeCLIModal';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Prompt } from 'src/components/Prompt/Prompt';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { ImageUploader } from 'src/components/Uploaders/ImageUploader/ImageUploader';
import { Dispatch } from 'src/hooks/types';
import { useFlags } from 'src/hooks/useFlags';
import { usePendingUpload } from 'src/hooks/usePendingUpload';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import { useUploadImageMutation } from 'src/queries/images';
import { imageQueries } from 'src/queries/images';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getGDPRDetails } from 'src/utilities/formatRegion';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';
import { ImageUploadSchema, recordImageAnalytics } from './ImageUpload.utils';
import {
  ImageUploadFormData,
  ImageUploadNavigationState,
} from './ImageUpload.utils';
import { uploadImageFile } from './requests';

import type { AxiosError, AxiosProgressEvent } from 'axios';

export const ImageUpload = () => {
  const { location } = useHistory<ImageUploadNavigationState | undefined>();

  const dispatch = useDispatch<Dispatch>();
  const hasPendingUpload = usePendingUpload();
  const { push } = useHistory();
  const flags = useFlags();

  const [uploadProgress, setUploadProgress] = useState<AxiosProgressEvent>();
  const cancelRef = React.useRef<(() => void) | null>(null);
  const [hasSignedAgreement, setHasSignedAgreement] = useState<boolean>(false);
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync: createImage } = useUploadImageMutation();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<ImageUploadFormData>({
    defaultValues: {
      description: location.state?.imageDescription,
      label: location.state?.imageLabel,
    },
    mode: 'onBlur',
    resolver: yupResolver(ImageUploadSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { file, ...createPayload } = values;

    try {
      const { image, upload_to } = await createImage(createPayload);

      // Invalidate images because a new Image has been created.
      queryClient.invalidateQueries(imageQueries.paginated._def);
      queryClient.invalidateQueries(imageQueries.all._def);

      // Let the entire app know that there's a pending upload via Redux.
      // High-level components like AuthenticationWrapper need to know
      // this, so the user isn't redirected to Login if the token expires.
      dispatch(setPendingUpload(true));

      recordImageAnalytics('start', file);

      try {
        const { cancel, request } = uploadImageFile(
          upload_to,
          file,
          setUploadProgress
        );

        cancelRef.current = cancel;

        await request();

        if (hasSignedAgreement) {
          updateAccountAgreements({
            eu_model: true,
            privacy_policy: true,
          }).catch(reportAgreementSigningError);
        }

        enqueueSnackbar(
          `Image ${image.label} uploaded successfully. It is being processed and will be available shortly.`,
          { variant: 'success' }
        );

        recordImageAnalytics('success', file);

        // Force a re-render so that `hasPendingUpload` is false when navigating away
        // from the upload page. We need this to make the <Prompt /> work as expected.
        flushSync(() => {
          dispatch(setPendingUpload(false));
        });

        push('/images');
      } catch (error) {
        // Handle an Axios error for the actual image upload
        form.setError('root', { message: (error as AxiosError).message });
        // Update Redux to show we have no upload in progress
        dispatch(setPendingUpload(false));
        recordImageAnalytics('fail', file);
      }
    } catch (errors) {
      // Handle API errors from the POST /v4/images/upload
      for (const error of errors) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          form.setError('root', { message: error.reason });
        }
      }
      // Update Redux to show we have no upload in progress
      dispatch(setPendingUpload(false));
    }
  });

  const selectedRegionId = form.watch('region');

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId,
  });

  const isImageCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_images',
  });

  // Called after a user confirms they want to navigate to another part of
  // Cloud during a pending upload. When we have refresh tokens this won't be
  // necessary; the user will be able to navigate to other components and we
  // will show the upload progress in the lower part of the screen. For now we
  // box the user on this page so we can handle token expiry (semi)-gracefully.
  const onConfirm = (nextLocation: string) => {
    if (cancelRef.current) {
      cancelRef.current();
    }

    dispatch(setPendingUpload(false));

    push(nextLocation);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Paper>
            <Typography mb={1.5} variant="h2">
              Image Details
            </Typography>
            {form.formState.errors.root?.message && (
              <Notice
                text={form.formState.errors.root.message}
                variant="error"
              />
            )}
            {isImageCreateRestricted && (
              <Notice
                text="You don't have permissions to create a new Image. Please contact an account administrator for details."
                variant="error"
              />
            )}
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isImageCreateRestricted}
                  errorText={fieldState.error?.message}
                  label="Label"
                  noMarginTop
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
              )}
              control={form.control}
              name="label"
            />
            {flags.metadata && (
              <Box pl={0.25} pt={2}>
                <Controller
                  render={({ field }) => (
                    <Checkbox
                      toolTipText={
                        <Typography>
                          Only check this box if your Custom Image is compatible
                          with cloud-init, or has cloud-init installed, and the
                          config has been changed to use our data service.{' '}
                          <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata-cloud-config/">
                            Learn how.
                          </Link>
                        </Typography>
                      }
                      checked={field.value ?? false}
                      disabled={isImageCreateRestricted}
                      onChange={field.onChange}
                      text="This image is cloud-init compatible"
                      toolTipInteractive
                    />
                  )}
                  control={form.control}
                  name="cloud_init"
                />
              </Box>
            )}
            <Controller
              render={({ field, fieldState }) => (
                <RegionSelect
                  textFieldProps={{
                    onBlur: field.onBlur,
                  }}
                  currentCapability={undefined}
                  disabled={isImageCreateRestricted}
                  errorText={fieldState.error?.message}
                  handleSelection={field.onChange}
                  helperText="For fastest initial upload, select the region that is geographically closest to you. Once uploaded you will be able to deploy the image to other regions."
                  label="Region"
                  regionFilter="core" // Images service will not be supported for Gecko Beta
                  regions={regions ?? []}
                  selectedId={field.value ?? null}
                />
              )}
              control={form.control}
              name="region"
            />
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
                  tagError={fieldState.error?.message}
                />
              )}
              control={form.control}
              name="tags"
            />
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isImageCreateRestricted}
                  errorText={fieldState.error?.message}
                  label="Description"
                  multiline
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  rows={1}
                  value={field.value ?? ''}
                />
              )}
              control={form.control}
              name="description"
            />
            {showGDPRCheckbox && (
              <EUAgreementCheckbox
                centerCheckbox
                checked={hasSignedAgreement}
                onChange={(e) => setHasSignedAgreement(e.target.checked)}
              />
            )}
          </Paper>
          <Paper>
            <Typography mb={1} variant="h2">
              Image Upload
            </Typography>
            <Notice
              spacingBottom={0}
              sx={{ fontSize: '0.875rem' }}
              variant="warning"
            >
              <Typography>
                Image files must be raw disk images (.img) compressed using gzip
                (.gz). The maximum file size is 5 GB (compressed) and maximum
                image size is 6 GB (uncompressed).
              </Typography>
            </Notice>
            <Typography sx={{ paddingBlock: 2 }}>
              Custom Images are billed at $0.10/GB per month based on the
              uncompressed image size.
            </Typography>
            <Controller
              render={({ field, fieldState }) => (
                <>
                  {fieldState.error?.message && (
                    <Notice text={fieldState.error.message} variant="error" />
                  )}
                  <ImageUploader
                    onDropAccepted={(files) => {
                      form.setError('file', {});
                      field.onChange(files[0]);
                    }}
                    onDropRejected={(fileRejections) => {
                      form.setError('file', {
                        message: fileRejections[0].errors[0].message,
                      });
                    }}
                    disabled={isImageCreateRestricted}
                    isUploading={form.formState.isSubmitting}
                    progress={uploadProgress}
                  />
                </>
              )}
              control={form.control}
              name="file"
            />
            <Typography sx={{ paddingTop: 2 }}>
              Or, upload an image using the{' '}
              <LinkButton onClick={() => setLinodeCLIModalOpen(true)}>
                Linode CLI
              </LinkButton>
              . For more information, please see{' '}
              <Link to="https://www.linode.com/docs/guides/linode-cli">
                our guide on using the Linode CLI
              </Link>
              .
            </Typography>
          </Paper>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              disabled={
                isImageCreateRestricted ||
                (showGDPRCheckbox && !hasSignedAgreement)
              }
              buttonType="primary"
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Upload Image
            </Button>
          </Box>
        </Stack>
      </form>
      <LinodeCLIModal
        analyticsKey="Image Upload"
        isOpen={linodeCLIModalOpen}
        onClose={() => setLinodeCLIModalOpen(false)}
      />
      <Prompt
        confirmWhenLeaving={true}
        onConfirm={onConfirm}
        when={hasPendingUpload}
      >
        {({ handleCancel, handleConfirm, isModalOpen }) => {
          return (
            <ConfirmationDialog
              actions={() => (
                <ActionsPanel
                  primaryButtonProps={{
                    label: 'Leave Page',
                    onClick: handleConfirm,
                  }}
                  secondaryButtonProps={{
                    label: 'Cancel',
                    onClick: handleCancel,
                  }}
                />
              )}
              onClose={handleCancel}
              open={isModalOpen}
              title="Leave this page?"
            >
              <Typography variant="subtitle1">
                An upload is in progress. If you navigate away from this page,
                the upload will be canceled.
              </Typography>
            </ConfirmationDialog>
          );
        }}
      </Prompt>
    </FormProvider>
  );
};
