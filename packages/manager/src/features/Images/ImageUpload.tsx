import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { LinodeCLIModal } from 'src/components/LinodeCLIModal/LinodeCLIModal';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Prompt } from 'src/components/Prompt/Prompt';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { Dispatch } from 'src/hooks/types';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useFlags } from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getGDPRDetails } from 'src/utilities/formatRegion';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';

import type { ImageUploadPayload } from '@linode/api-v4';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';

export const ImageUpload = () => {
  const { location } = useHistory<
    | {
        imageDescription: string;
        imageLabel?: string;
      }
    | undefined
  >();

  const form = useForm<ImageUploadPayload>({
    defaultValues: {
      description: location.state?.imageDescription,
      label: location.state?.imageLabel,
    },
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

  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = React.useState<boolean>(
    false
  );

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId,
  });

  //  This holds a "cancel function" from the Axios instance that handles image
  // uploads. Calling this function will cancel the HTTP request.
  const [cancelFn, setCancelFn] = React.useState<(() => void) | null>(null);

  // Whether or not there is an upload pending. This is stored in Redux since
  // high-level components like AuthenticationWrapper need to read it.
  const pendingUpload = useSelector<ApplicationState, boolean>(
    (state) => state.pendingUpload
  );

  // Keep track of the session token since we may need to grab the user a new
  // one after a long upload (if their session has expired).
  const currentToken = useCurrentToken();

  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

  // Called after a user confirms they want to navigate to another part of
  // Cloud during a pending upload. When we have refresh tokens this won't be
  // necessary; the user will be able to navigate to other components and we
  // will show the upload progress in the lower part of the screen. For now we
  // box the user on this page so we can handle token expiry (semi)-gracefully.
  const onConfirm = (nextLocation: string) => {
    if (cancelFn) {
      cancelFn();
    }

    dispatch(setPendingUpload(false));

    // If the user's session has expired we need to send them to Login to get
    // a new token. They will be redirected back to path they were trying to
    // reach.
    if (!currentToken) {
      redirectToLogin(nextLocation);
    } else {
      push(nextLocation);
    }
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
      <Paper>
        {form.formState.errors.root?.message && (
          <Notice text={form.formState.errors.root.message} variant="error" />
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
              onChange={field.onChange}
              required
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
                    Only check this box if your Custom Image is compatible with
                    cloud-init, or has cloud-init installed, and the config has
                    been changed to use our data service.{' '}
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
              required
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
        <Notice spacingTop={24} sx={{ fontSize: '0.875rem' }} variant="warning">
          <Typography>
            Image files must be raw disk images (.img) compressed using gzip
            (.gz). The maximum file size is 5 GB (compressed) and maximum image
            size is 6 GB (uncompressed).
          </Typography>
        </Notice>
        <Typography>
          Custom Images are billed at $0.10/GB per month based on the
          uncompressed image size.
        </Typography>
        {/* <ImageUploader
          apiError={errorMap.none} // Any errors that aren't related to 'label', 'description', or 'region' fields
          description={description}
          dropzoneDisabled={uploadingDisabled}
          isCloudInit={isCloudInit}
          label={label}
          onSuccess={onSuccess}
          region={region}
          setCancelFn={setCancelFn}
          setErrors={setErrors}
        /> */}
        <Typography sx={{ paddingBottom: 1, paddingTop: 2 }}>
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
      <Box>
        <Button>Upload Image</Button>
        </Box>
      <LinodeCLIModal
        analyticsKey="Image Upload"
        isOpen={linodeCLIModalOpen}
        onClose={() => setLinodeCLIModalOpen(false)}
      />
    </FormProvider>
  );
};
