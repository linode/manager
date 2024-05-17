import { yupResolver } from '@hookform/resolvers/yup';
import { uploadImageSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { mixed } from 'yup';

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
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { ImageUploader } from 'src/components/Uploaders/ImageUploader/ImageUploader';
import { Dispatch } from 'src/hooks/types';
import { useFlags } from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import { useUploadImageMutation } from 'src/queries/images';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { ApplicationState } from 'src/store';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getGDPRDetails } from 'src/utilities/formatRegion';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';
import { uploadImageFile } from './requests';

import type { ImageUploadPayload } from '@linode/api-v4';
import type { AxiosProgressEvent } from 'axios';

interface ImageUploadFormData extends ImageUploadPayload {
  file: File;
}

const ImageUploadSchema = uploadImageSchema.shape({
  file: mixed().required('You must pick an Image to upload.'),
});

export const ImageUpload = () => {
  const { location } = useHistory<
    | {
        imageDescription?: string;
        imageLabel?: string;
      }
    | undefined
  >();

  const { mutateAsync: createImage } = useUploadImageMutation();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<ImageUploadFormData>({
    defaultValues: {
      description: location.state?.imageDescription,
      label: location.state?.imageLabel,
    },
    resolver: yupResolver(ImageUploadSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { file, ...createPayload } = values;
    try {
      const { upload_to } = await createImage(createPayload);
      enqueueSnackbar('Image creation successful, upload will begin');

      try {
        const { cancel, request } = uploadImageFile(
          upload_to,
          file,
          setUploadProgress
        );

        cancelRef.current = cancel;

        await request();

        enqueueSnackbar('Upload successfull');
        push('/images');
      } catch (error) {}
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          form.setError('root', { message: error.reason });
        }
      }
    }
  });

  const selectedRegionId = form.watch('region');

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const regions = useRegionsQuery().data ?? [];
  const dispatch: Dispatch = useDispatch();
  const { push } = useHistory();
  const flags = useFlags();

  const [uploadProgress, setUploadProgress] = useState<AxiosProgressEvent>();
  const cancelRef = React.useRef<(() => void) | null>(null);
  const [hasSignedAgreement, setHasSignedAgreement] = useState<boolean>(false);
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = useState<boolean>(false);

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId,
  });

  // Whether or not there is an upload pending. This is stored in Redux since
  // high-level components like AuthenticationWrapper need to read it.
  const pendingUpload = useSelector<ApplicationState, boolean>(
    (state) => state.pendingUpload
  );

  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

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

  const onSuccess = () => {
    if (hasSignedAgreement) {
      updateAccountAgreements({
        eu_model: true,
        privacy_policy: true,
      }).catch(reportAgreementSigningError);
    }
  };

  const uploadingDisabled =
    !canCreateImage || (showGDPRCheckbox && !hasSignedAgreement);

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Paper>
            {form.formState.errors.root?.message && (
              <Notice
                text={form.formState.errors.root.message}
                variant="error"
              />
            )}
            {!canCreateImage && (
              <Notice
                text="You don't have permissions to create a new Image. Please contact an account administrator for details."
                variant="error"
              />
            )}
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={!canCreateImage}
                  errorText={fieldState.error?.message}
                  label="Label"
                  noMarginTop
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
              )}
              control={form.control}
              name="label"
            />
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  disabled={!canCreateImage}
                  errorText={fieldState.error?.message}
                  label="Description"
                  multiline
                  onChange={field.onChange}
                  rows={1}
                  value={field.value ?? ''}
                />
              )}
              control={form.control}
              name="description"
            />
            {flags.metadata && (
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
                    onChange={field.onChange}
                    text="This image is cloud-init compatible"
                    toolTipInteractive
                  />
                )}
                control={form.control}
                name="cloud_init"
              />
            )}
            <Controller
              render={({ field, fieldState }) => (
                <RegionSelect
                  currentCapability={undefined}
                  disabled={!canCreateImage}
                  errorText={fieldState.error?.message}
                  handleSelection={field.onChange}
                  helperText="For fastest initial upload, select the region that is geographically closest to you. Once uploaded you will be able to deploy the image to other regions."
                  label="Region"
                  regionFilter="core" // Images service will not be supported for Gecko Beta
                  regions={regions}
                  selectedId={field.value ?? null}
                />
              )}
              control={form.control}
              name="region"
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
                    onDropRejected={(fileRejections) =>
                      form.setError('file', {
                        message: fileRejections[0].errors[0].message,
                      })
                    }
                    onDrop={(files) => field.onChange(files[0])}
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
          <Box display="flex" justifyContent="flex-end">
            <Button
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
        when={pendingUpload}
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
