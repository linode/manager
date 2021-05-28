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
import Notice from 'src/components/Notice';
import Prompt from 'src/components/Prompt';
import TextField from 'src/components/TextField';
import { Dispatch } from 'src/hooks/types';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useRegionsQuery } from 'src/queries/regions';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { uploadImage } from 'src/store/image/image.requests';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: '100%',
    padding: theme.spacing(3),
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
  },
  helperText: {
    marginTop: theme.spacing(2),
    width: '65%',
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
  generateUrlButton: {
    ...theme.applyLinkStyles,
    fontWeight: 700,
    marginTop: '0.5rem',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
      color: theme.cmrTextColors.linkActiveLight,
    },
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
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [urlButtonDisabled, setUrlButtonDisabled] = React.useState<boolean>(
    false
  );

  const [cancelFn, setCancelFn] = React.useState<(() => void) | null>(null);

  const pendingUpload = useSelector<ApplicationState, boolean>(
    (state) => state.pendingUpload
  );

  // Keep track of the session token since we may need to grab the user a new
  // one after a long upload (if their session has expired). This is stored in
  // a ref because closures.
  const { token } = useAuthentication();
  const tokenRef = React.useRef(token);
  React.useEffect(() => {
    tokenRef.current = token;
  });

  const uploadingDisabled = !label || !region;

  const handleSubmit = () => {
    setSubmitting(true);
    setErrors(undefined);
    dispatch(
      uploadImage({
        label,
        description: description || undefined,
        region,
      })
    )
      .then((response) => {
        setSubmitting(false);
        push({
          pathname: '/images',
          state: {
            upload_url: response.upload_to,
          },
        });
      })
      .catch((e) => {
        setSubmitting(false);
        setErrors(e);
      });
  };

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  const onConfirm = (nextLocation: string) => {
    if (cancelFn) {
      cancelFn();
    }

    dispatch(setPendingUpload(false));

    if (!tokenRef.current) {
      redirectToLogin(nextLocation);
    } else {
      push(nextLocation);
    }
  };

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
              title="Cancel Image upload?"
              actions={() => (
                <ActionsPanel>
                  <Button buttonType="cancel" onClick={handleConfirm}>
                    Leave and cancel upload
                  </Button>

                  <Button buttonType="primary" onClick={handleCancel}>
                    Go back and continue upload
                  </Button>
                </ActionsPanel>
              )}
            >
              <Typography variant="subtitle1">
                An Image upload is currently in progress. If you navigate away
                from this page, the upload will be canceled.
              </Typography>
            </ConfirmationDialog>
          );
        }}
      </Prompt>

      <Paper className={classes.container}>
        {errorMap.none ? <Notice error text={errorMap.none} /> : null}
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
            to other regions.
          </Typography>

          <FileUploader
            label={label}
            description={description}
            region={region}
            dropzoneDisabled={uploadingDisabled}
            setErrors={setErrors}
            setUrlButtonDisabled={setUrlButtonDisabled}
            setCancelFn={setCancelFn}
            // setUploadInProgress={setUploadInProgress}
          />
          <ActionsPanel style={{ marginTop: 16 }}>
            <Typography>
              If you would prefer to upload your Image using another tool, you
              may generate a URL below. For more information on this option, see
              our{' '}
              <Link to="https://www.linode.com/docs/guides/linode-images/#uploading-an-image-through-the-cloud-manager">
                Images guide
              </Link>
              .
            </Typography>
            <Button
              onClick={handleSubmit}
              disabled={
                uploadingDisabled || urlButtonDisabled || !canCreateImage
              }
              loading={submitting}
              className={classes.generateUrlButton}
            >
              Generate URL for Upload
            </Button>
          </ActionsPanel>
        </div>
      </Paper>
    </>
  );
};

export default ImageUpload;
