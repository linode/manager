import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Chip from 'src/components/core/Chip';
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
import { useRegionsQuery } from 'src/queries/regions';
import { uploadImage } from 'src/store/image/image.requests';
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

  const [dropzoneIsVisible, setDropzoneIsVisible] = React.useState<boolean>(
    false
  );
  const [uploadInProgress, setUploadInProgress] = React.useState<boolean>(
    false
  );

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

  const showDropzone = () => {
    setDropzoneIsVisible(!dropzoneIsVisible);
  };

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  return (
    <>
      <Prompt when={uploadInProgress} confirmWhenLeaving={true}>
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
        <Typography style={{ marginTop: 16 }}>
          <Chip className={classes.chip} label="beta" component="span" />
          Image Uploads is currently in beta and is subject to the terms of the{' '}
          <Link to="https://www.linode.com/legal-eatp/">
            Early Adopter Testing Agreement
          </Link>
          .
        </Typography>
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
          <Typography className={classes.helperText}>
            Closing this browser tab or window will cancel the upload. To use
            other parts of Cloud Manager while your upload is in progress, we
            recommend opening another tab or window.
          </Typography>

          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              onClick={handleSubmit}
              disabled={region === '' || !canCreateImage}
              loading={submitting}
              buttonType="primary"
            >
              Generate URL
            </Button>
            <Button
              onClick={showDropzone}
              disabled={region === '' || !canCreateImage}
              loading={submitting}
              buttonType="primary"
              className={classes.browseFilesButton}
            >
              Browse Files
            </Button>
          </ActionsPanel>
          {dropzoneIsVisible ? (
            <FileUploader
              label={label}
              description={description}
              region={region}
              setUploadInProgress={setUploadInProgress}
            />
          ) : null}
        </div>
      </Paper>
    </>
  );
};

export default ImageUpload;
