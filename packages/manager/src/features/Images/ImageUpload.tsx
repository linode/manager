import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { FileUploader } from 'src/components/FileUploader/FileUploader';
import { Link } from 'src/components/Link';
import { LinodeCLIModal } from 'src/components/LinodeCLIModal/LinodeCLIModal';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Prompt } from 'src/components/Prompt/Prompt';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { Dispatch } from 'src/hooks/types';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useFlags } from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getErrorMap } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import { wrapInQuotes } from 'src/utilities/stringUtils';

import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';

const useStyles = makeStyles((theme: Theme) => ({
  browseFilesButton: {
    marginLeft: '1rem',
  },
  cliModalButton: {
    ...theme.applyLinkStyles,
    fontWeight: 700,
  },
  cloudInitCheckboxWrapper: {
    marginLeft: '3px',
    marginTop: theme.spacing(2),
  },
  container: {
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
    minWidth: '100%',
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(2),
  },
  helperText: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '90%',
  },
}));

const cloudInitTooltipMessage = (
  <Typography>
    Only check this box if your Custom Image is compatible with cloud-init, or
    has cloud-init installed, and the config has been changed to use our data
    service.{' '}
    <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata-cloud-config/">
      Learn how.
    </Link>
  </Typography>
);

const imageSizeLimitsMessage = (
  <Typography>
    Image files must be raw disk images (.img) compressed using gzip (.gz). The
    maximum file size is 5 GB (compressed) and maximum image size is 6 GB
    (uncompressed).
  </Typography>
);

export interface Props {
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeIsCloudInit: () => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  isCloudInit: boolean;
  label: string;
}

export const ImageUpload: React.FC<Props> = (props) => {
  const {
    changeDescription,
    changeIsCloudInit,
    changeLabel,
    description,
    isCloudInit,
    label,
  } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const classes = useStyles();
  const regions = useRegionsQuery().data ?? [];
  const dispatch: Dispatch = useDispatch();
  const { push } = useHistory();
  const flags = useFlags();

  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const [region, setRegion] = React.useState<string>('');
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = React.useState<boolean>(
    false
  );

  const showAgreement = Boolean(
    !profile?.restricted && agreements?.eu_model === false && isEURegion(region)
  );

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
    !label ||
    !region ||
    !canCreateImage ||
    (showAgreement && !hasSignedAgreement);

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  const cliLabel = formatForCLI(label, 'label');
  const cliDescription = formatForCLI(description, 'description');
  const cliRegion = formatForCLI(region, 'region');
  const linodeCLICommand = `linode-cli image-upload --label ${cliLabel} --description ${cliDescription} --region ${cliRegion} FILE`;

  return (
    <>
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

      <Paper className={classes.container}>
        {errorMap.none ? <Notice variant="error" text={errorMap.none} /> : null}
        {!canCreateImage ? (
          <Notice
            variant="error"
            text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          />
        ) : null}

        <div style={{ width: '100%' }}>
          <TextField
            disabled={!canCreateImage}
            errorText={errorMap.label}
            label="Label"
            onChange={changeLabel}
            required
            value={label}
          />

          <TextField
            disabled={!canCreateImage}
            errorText={errorMap.description}
            label="Description"
            multiline
            onChange={changeDescription}
            rows={1}
            value={description}
          />
          {flags.metadata && (
            <div className={classes.cloudInitCheckboxWrapper}>
              <Checkbox
                checked={isCloudInit}
                onChange={changeIsCloudInit}
                text="This image is cloud-init compatible"
                toolTipInteractive
                toolTipText={cloudInitTooltipMessage}
              />
            </div>
          )}
          <RegionSelect
            helperText="For fastest initial upload, select the region that is geographically
            closest to you. Once uploaded you will be able to deploy the image
            to other regions."
            disabled={!canCreateImage}
            errorText={errorMap.region}
            handleSelection={setRegion}
            label="Region"
            regions={regions}
            required
            selectedID={region}
          />

          {showAgreement ? (
            <EUAgreementCheckbox
              centerCheckbox
              checked={hasSignedAgreement}
              className={classes.helperText}
              onChange={(e) => setHasSignedAgreement(e.target.checked)}
            />
          ) : null}

          <Notice
            spacingTop={24}
            variant="warning"
            sx={{ fontSize: '0.875rem' }}
          >
            {imageSizeLimitsMessage}
          </Notice>

          <Typography className={classes.helperText}>
            Custom Images are billed at $0.10/GB per month based on the
            uncompressed image size.
          </Typography>

          <FileUploader
            apiError={errorMap.none} // Any errors that aren't related to 'label', 'description', or 'region' fields
            description={description}
            dropzoneDisabled={uploadingDisabled}
            isCloudInit={isCloudInit}
            label={label}
            onSuccess={onSuccess}
            region={region}
            setCancelFn={setCancelFn}
            setErrors={setErrors}
          />
          <Typography sx={{ paddingBottom: 8, paddingTop: 16 }}>
            Or, upload an image using the{' '}
            <button
              className={classes.cliModalButton}
              onClick={() => setLinodeCLIModalOpen(true)}
            >
              Linode CLI
            </button>
            . For more information, please see{' '}
            <Link to="https://www.linode.com/docs/guides/linode-cli">
              our guide on using the Linode CLI
            </Link>
            .
          </Typography>
        </div>
      </Paper>
      <LinodeCLIModal
        analyticsKey="Image Upload"
        command={linodeCLICommand}
        isOpen={linodeCLIModalOpen}
        onClose={() => setLinodeCLIModalOpen(false)}
      />
    </>
  );
};

export default ImageUpload;

const formatForCLI = (value: string, fallback: string) => {
  return value ? wrapInQuotes(value) : `[${fallback.toUpperCase()}]`;
};
