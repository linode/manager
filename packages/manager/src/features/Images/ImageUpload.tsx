import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import FileUploader from 'src/components/FileUploader/FileUploader';
import Link from 'src/components/Link';
import LinodeCLIModal from 'src/components/LinodeCLIModal';
import Notice from 'src/components/Notice';
import Prompt from 'src/components/Prompt';
import TextField from 'src/components/TextField';
import { Dispatch } from 'src/hooks/types';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useRegionsQuery } from 'src/queries/regions';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getErrorMap } from 'src/utilities/errorUtils';
import { wrapInQuotes } from 'src/utilities/stringUtils';
import ImagesPricingCopy from './ImagesCreate/ImagesPricingCopy';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: '100%',
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
  },
  helperText: {
    marginTop: theme.spacing(2),
  },
  chip: {
    fontSize: '0.625rem',
    height: 15,
    marginBottom: 4,
    lineHeight: '1px',
    letterSpacing: '.25px',
    textTransform: 'uppercase',
  },
  browseFilesButton: {
    marginLeft: '1rem',
  },
  cliModalButton: {
    ...theme.applyLinkStyles,
    fontWeight: 700,
  },
}));
export interface Props {
  label: string;
  description: string;
  canCreateImage?: boolean;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUpload: React.FC<Props> = (props) => {
  const {
    canCreateImage,
    label,
    description,
    changeLabel,
    changeDescription,
  } = props;
  const classes = useStyles();
  const { push } = useHistory();
  const [region, setRegion] = React.useState<string>('');
  const dispatch: Dispatch = useDispatch();
  const regions = useRegionsQuery().data ?? [];
  // @todo replace this with React-query
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = React.useState<boolean>(
    false
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

  const uploadingDisabled = !label || !region;

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  const cliLabel = formatForCLI(label, 'label');
  const cliDescription = formatForCLI(description, 'description');
  const cliRegion = formatForCLI(region, 'region');
  const linodeCLICommand = `linode-cli image-upload --label ${cliLabel} --description ${cliDescription} --region ${cliRegion} FILE`;

  return (
    <>
      <Prompt
        when={pendingUpload}
        confirmWhenLeaving={true}
        onConfirm={onConfirm}
      >
        {({ isModalOpen, handleCancel, handleConfirm }) => {
          return (
            <ConfirmationDialog
              open={isModalOpen}
              onClose={handleCancel}
              title="Leave this page?"
              actions={() => (
                <ActionsPanel>
                  <Button buttonType="cancel" onClick={handleCancel}>
                    Cancel
                  </Button>

                  <Button buttonType="primary" onClick={handleConfirm}>
                    Leave Page
                  </Button>
                </ActionsPanel>
              )}
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
        {errorMap.none ? <Notice error text={errorMap.none} /> : null}

        <ImagesPricingCopy type="uploadImage" />

        <div style={{ width: '100%' }}>
          <TextField
            label="Label (required)"
            value={label}
            onChange={changeLabel}
            errorText={errorMap.label}
            disabled={!canCreateImage}
          />

          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={changeDescription}
            errorText={errorMap.description}
            disabled={!canCreateImage}
          />

          <RegionSelect
            label={'Region (required)'}
            errorText={errorMap.region}
            handleSelection={setRegion}
            regions={regions}
            selectedID={region}
          />

          <Typography className={classes.helperText}>
            For fastest initial upload, select the region that is geographically
            closest to you. Once uploaded you will be able to deploy the image
            to other regions. Image files must be raw disk images (.img)
            compressed using gzip (.gz). The maximum file size is 5 GB
            (compressed).
          </Typography>

          <FileUploader
            label={label}
            description={description}
            region={region}
            dropzoneDisabled={uploadingDisabled}
            setErrors={setErrors}
            setCancelFn={setCancelFn}
          />
          <ActionsPanel>
            <Typography>
              Or, upload an image using the{' '}
              <button
                className={classes.cliModalButton}
                onClick={() => setLinodeCLIModalOpen(true)}
              >
                Linode CLI
              </button>
              . For information, please see our guide on{' '}
              <Link to="https://www.linode.com/docs/guides/linode-cli">
                using the Linode CLI
              </Link>
              .
            </Typography>
          </ActionsPanel>
        </div>
      </Paper>
      <LinodeCLIModal
        isOpen={linodeCLIModalOpen}
        onClose={() => setLinodeCLIModalOpen(false)}
        command={linodeCLICommand}
      />
    </>
  );
};

export default ImageUpload;

const formatForCLI = (value: string, fallback: string) => {
  return value ? wrapInQuotes(value) : `[${fallback.toUpperCase()}]`;
};
