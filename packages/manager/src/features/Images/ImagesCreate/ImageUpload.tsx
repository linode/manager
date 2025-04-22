import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAccountAgreements,
  useMutateAccountAgreements,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  ActionsPanel,
  Box,
  Button,
  Checkbox,
  Notice,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
// eslint-disable-next-line no-restricted-imports
import { Prompt } from 'src/components/Prompt/Prompt';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { ImageUploader } from 'src/components/Uploaders/ImageUploader/ImageUploader';
import { MAX_FILE_SIZE_IN_BYTES } from 'src/components/Uploaders/reducer';
import { useFlags } from 'src/hooks/useFlags';
import { usePendingUpload } from 'src/hooks/usePendingUpload';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useUploadImageMutation } from 'src/queries/images';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { reportAgreementSigningError } from 'src/utilities/reportAgreementSigningError';

import { EUAgreementCheckbox } from '../../Account/Agreements/EUAgreementCheckbox';
import { getRestrictedResourceText } from '../../Account/utils';
import { uploadImageFile } from '../requests';
import { ImageUploadSchema, recordImageAnalytics } from './ImageUpload.utils';
import { ImageUploadCLIDialog } from './ImageUploadCLIDialog';

import type { ImageUploadFormData } from './ImageUpload.utils';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import type { Dispatch } from 'src/hooks/types';

export const ImageUpload = () => {
  const { imageDescription, imageLabel } = useSearch({
    strict: false,
  });
  const navigate = useNavigate();

  const dispatch = useDispatch<Dispatch>();
  const hasPendingUpload = usePendingUpload();
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const [uploadProgress, setUploadProgress] = useState<AxiosProgressEvent>();
  const cancelRef = React.useRef<(() => void) | null>(null);
  const [hasSignedAgreement, setHasSignedAgreement] = useState<boolean>(false);
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = useState<boolean>(false);

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync: createImage } = useUploadImageMutation();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<ImageUploadFormData>({
    defaultValues: {
      description: imageDescription,
      label: imageLabel,
    },
    mode: 'onBlur',
    resolver: yupResolver(ImageUploadSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { file, ...createPayload } = values;

    try {
      const { image, upload_to } = await createImage(createPayload);

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

        navigate({ search: () => ({}), to: '/images' });
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
          window.scrollTo({ top: 0 });
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

    navigate({ search: () => ({}), to: nextLocation });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {isImageCreateRestricted && (
            <Notice
              text={getRestrictedResourceText({
                action: 'create',
                isSingular: false,
                resourceType: 'Images',
              })}
              variant="error"
            />
          )}
          <Paper>
            <Typography mb={2} variant="h2">
              Image Details
            </Typography>
            <Typography>
              Custom images are{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/upload-an-image#upload-an-image-file">
                encrypted
              </Link>{' '}
              and billed monthly at $0.10/GB. An uploaded image file needs to
              meet specific{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/upload-an-image#requirements-and-considerations">
                requirements
              </Link>
              .
            </Typography>
            {form.formState.errors.root?.message && (
              <Notice
                text={form.formState.errors.root.message}
                variant="error"
              />
            )}
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={
                    isImageCreateRestricted || form.formState.isSubmitting
                  }
                  errorText={fieldState.error?.message}
                  inputRef={field.ref}
                  label="Label"
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
                      disabled={
                        isImageCreateRestricted || form.formState.isSubmitting
                      }
                      toolTipText={
                        <Typography>
                          Only check this box if your Custom Image is compatible
                          with cloud-init, or has cloud-init installed, and the
                          config has been changed to use our data service.{' '}
                          <Link to="https://techdocs.akamai.com/cloud-computing/docs/using-cloud-config-files-to-configure-a-server">
                            Learn how.
                          </Link>
                        </Typography>
                      }
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      text="This image is cloud-init compatible"
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
                  disabled={
                    isImageCreateRestricted || form.formState.isSubmitting
                  }
                  textFieldProps={{
                    inputRef: field.ref,
                    onBlur: field.onBlur,
                  }}
                  currentCapability="Object Storage" // Images use Object Storage as their storage backend
                  disableClearable
                  errorText={fieldState.error?.message}
                  ignoreAccountAvailability
                  isGeckoLAEnabled={isGeckoLAEnabled}
                  label="Region"
                  onChange={(e, region) => field.onChange(region.id)}
                  regionFilter="core" // Images service will not be supported for Gecko Beta
                  regions={regions ?? []}
                  value={field.value ?? null}
                />
              )}
              control={form.control}
              name="region"
            />
            <Controller
              render={({ field, fieldState }) => (
                <TagsInput
                  disabled={
                    isImageCreateRestricted || form.formState.isSubmitting
                  }
                  onChange={(items) =>
                    field.onChange(items.map((item) => item.value))
                  }
                  value={
                    field.value?.map((tag) => ({ label: tag, value: tag })) ??
                    []
                  }
                  tagError={fieldState.error?.message}
                />
              )}
              control={form.control}
              name="tags"
            />
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={
                    isImageCreateRestricted || form.formState.isSubmitting
                  }
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
            {form.formState.errors.file?.message && (
              <Notice
                spacingBottom={12}
                text={form.formState.errors.file.message}
                variant="error"
              />
            )}
            <Controller
              render={({ field }) => (
                <ImageUploader
                  onDropAccepted={(files) => {
                    form.setError('file', {});
                    field.onChange(files[0]);
                  }}
                  onDropRejected={(fileRejections) => {
                    let message = '';
                    switch (fileRejections[0].errors[0].code) {
                      case 'file-invalid-type':
                        message =
                          'Only raw disk images (.img) compressed using gzip (.gz) can be uploaded.';
                        break;
                      case 'file-too-large':
                        message = `Max file size (${
                          readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
                        }) exceeded`;
                        break;
                      default:
                        message = fileRejections[0].errors[0].message;
                    }
                    form.setError('file', { message });
                    form.resetField('file', { keepError: true });
                  }}
                  disabled={isImageCreateRestricted}
                  isUploading={form.formState.isSubmitting}
                  progress={uploadProgress}
                />
              )}
              control={form.control}
              name="file"
            />
          </Paper>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              buttonType="outlined"
              disabled={isImageCreateRestricted}
              onClick={() => setLinodeCLIModalOpen(true)}
            >
              Upload Using Command Line
            </Button>
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
      <ImageUploadCLIDialog
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
              actions={
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
              }
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
