import { APIError } from '@linode/api-v4/lib/types';
import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { uploadImageFile } from 'src/features/Images/requests';
import FileUpload from 'src/features/ObjectStorage/ObjectUploader/FileUpload';
import { onUploadProgressFactory } from 'src/features/ObjectStorage/ObjectUploader/ObjectUploader';
import {
  curriedObjectUploaderReducer,
  defaultState,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_PARALLEL_UPLOADS,
  pathOrFileName,
} from 'src/features/ObjectStorage/ObjectUploader/reducer';
import { Dispatch } from 'src/hooks/types';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { redirectToLogin } from 'src/session';
import { uploadImage } from 'src/store/image/image.requests';
import { setPendingUpload } from 'src/store/pendingUpload';
import { readableBytes } from 'src/utilities/unitConversions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: 30,
    position: 'relative',
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    borderWidth: 1,
    color: theme.palette.primary.main,
    height: '100%',
    maxHeight: 400,
    marginTop: theme.spacing(2),
    minHeight: 140,
    outline: 'none',
    overflow: 'auto',
    padding: theme.spacing(),
    transition: theme.transitions.create(['border-color', 'background-color']),
  },
  active: {
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.color.white,
    '& $uploadButton': {
      opacity: 0.5,
    },
  },
  inactive: {
    // When the dropzone is disabled
    borderColor: '#888',
    '& $uploadButton': {
      backgroundColor: theme.color.grey6,
      '&:hover': {
        cursor: 'default',
      },
    },
  },
  accept: {
    // The `accept` class active when a user is hovering over the dropzone
    // with files that will be accepted (based on file size, number of files).
    borderColor: theme.palette.primary.light,
  },
  reject: {
    // The `reject` class active when a user is hovering over the dropzone
    // with files that will be rejected (based on file size, number of files).
    borderColor: theme.color.red,
  },
  fileUploads: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    textAlign: 'center',
    width: '100%',
  },
  UploadZoneActiveButton: {
    backgroundColor: 'transparent',
    bottom: theme.spacing(1.5),
    padding: 0,
    position: 'absolute',
    width: `calc(100% - ${theme.spacing(4)}px)`,
    zIndex: 10,
    '& $uploadButton': {
      marginTop: 0,
    },
  },
  copy: {
    color: theme.palette.text.primary,
    margin: '0 auto',
  },
  uploadButton: {
    marginTop: theme.spacing(2),
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
  },
}));

interface Props {
  label: string;
  description?: string;
  region: string;
  dropzoneDisabled: boolean;
  apiError: string | undefined;
  setErrors: React.Dispatch<React.SetStateAction<APIError[] | undefined>>;
  // Send a function for cancelling the upload back to the parent.
  setCancelFn: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

type CombinedProps = Props & WithSnackbarProps;

const FileUploader: React.FC<CombinedProps> = (props) => {
  const {
    label,
    description,
    region,
    dropzoneDisabled,
    apiError,
    setErrors,
  } = props;

  const [uploadToURL, setUploadToURL] = React.useState<string>('');

  const classes = useStyles();
  const history = useHistory();

  // Keep track of the session token since we may need to grab the user a new
  // one after a long upload (if their session has expired).
  const currentToken = useCurrentToken();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  const dispatchAction: Dispatch = useDispatch();

  React.useEffect(() => {
    const preventDefault = (e: any) => {
      e.preventDefault();
    };

    // This event listeners prevent the browser from opening files dropped on
    // the screen, which was happening when the dropzone was disabled.

    // eslint-disable-next-line scanjs-rules/call_addEventListener
    window.addEventListener('dragover', preventDefault);
    // eslint-disable-next-line scanjs-rules/call_addEventListener
    window.addEventListener('drop', preventDefault);

    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  // This function is fired when files are dropped in the upload area.
  const onDrop = (files: File[]) => {
    const prefix = '';

    // If an upload attempt failed previously, clear the dropzone.
    if (state.numErrors > 0) {
      dispatch({ type: 'CLEAR_UPLOAD_HISTORY' });
    }

    dispatch({ type: 'ENQUEUE', files, prefix });
  };

  // This function will be called when the user drops non-.gz files, more than one file at a time, or files that are over the max size.
  const onDropRejected = (files: FileRejection[]) => {
    const wrongFileType = files[0].file.type !== 'application/x-gzip';
    const fileTypeErrorMessage =
      'Only raw disk images (.img) compressed using gzip (.gz) can be uploaded.';

    const moreThanOneFile = files.length > 1;
    const fileNumberErrorMessage = 'Only one file may be uploaded at a time.';

    const fileSizeErrorMessage = `Max file size (${
      readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
    }) exceeded`;

    if (wrongFileType) {
      props.enqueueSnackbar(fileTypeErrorMessage, {
        variant: 'error',
        autoHideDuration: 10000,
      });
    } else if (moreThanOneFile) {
      props.enqueueSnackbar(fileNumberErrorMessage, {
        variant: 'error',
        autoHideDuration: 10000,
      });
    } else {
      props.enqueueSnackbar(fileSizeErrorMessage, {
        variant: 'error',
        autoHideDuration: 10000,
      });
    }
  };

  const nextBatch = React.useMemo(() => {
    if (state.numQueued === 0 || state.numInProgress > 0) {
      return [];
    }

    const queuedUploads = state.files.filter(
      (upload) => upload.status === 'QUEUED'
    );

    return queuedUploads.slice(0, MAX_PARALLEL_UPLOADS - state.numInProgress);
  }, [state.numQueued, state.numInProgress, state.files]);

  const uploadInProgressOrFinished =
    state.numInProgress > 0 || state.numFinished > 0;

  // When `nextBatch` changes, upload the files.
  React.useEffect(() => {
    if (nextBatch.length === 0) {
      return;
    }

    nextBatch.forEach((fileUpload) => {
      const { file } = fileUpload;

      const path = pathOrFileName(fileUpload.file);

      const onUploadProgress = onUploadProgressFactory(dispatch, path);

      const handleSuccess = () => {
        dispatch({
          type: 'UPDATE_FILES',
          filesToUpdate: [path],
          data: {
            percentComplete: 100,
            status: 'FINISHED',
          },
        });

        const successfulUploadMessage = `${file.name} successfully uploaded to ${label}.`;

        props.enqueueSnackbar(successfulUploadMessage, {
          variant: 'success',
          persist: true,
        });

        dispatchAction(setPendingUpload(false));

        // EDGE CASE:
        // The upload has finished, but the user's token has expired.
        // Show the toast, then redirect them to /images, passing them through
        // Login to get a new token.
        if (!currentToken) {
          setTimeout(() => {
            redirectToLogin('/images');
          }, 3000);
        } else {
          history.push('/images');
        }
      };

      const handleError = () => {
        dispatch({
          type: 'UPDATE_FILES',
          filesToUpdate: [path],
          data: {
            status: 'ERROR',
          },
        });

        dispatchAction(setPendingUpload(false));
      };

      if (!uploadToURL) {
        dispatchAction(
          uploadImage({
            label,
            description: description || undefined,
            region,
          })
        )
          .then((response) => {
            setUploadToURL(response.upload_to);

            // Let the entire app know that there's a pending upload via Redux.
            // High-level components like AuthenticationWrapper need to know
            // this, so the user isn't redirected to Login if the token expires.
            dispatchAction(setPendingUpload(true));

            dispatch({
              type: 'UPDATE_FILES',
              filesToUpdate: [pathOrFileName(fileUpload.file)],
              data: { status: 'IN_PROGRESS' },
            });

            const { request, cancel } = uploadImageFile(
              response.upload_to,
              file,
              onUploadProgress
            );

            // The parent might need to cancel this upload (e.g. if the user
            // navigates away from the page).
            props.setCancelFn(() => () => cancel());

            request()
              .then(() => handleSuccess())
              .catch(() => handleError());
          })
          .catch((e) => {
            dispatch({ type: 'CLEAR_UPLOAD_HISTORY' });
            setErrors(e);
          });
      } else {
        // Overwrite any file that was previously uploaded to the upload_to URL.
        const { request, cancel } = uploadImageFile(
          uploadToURL,
          file,
          onUploadProgress
        );

        props.setCancelFn(cancel);

        request()
          .then(() => handleSuccess())
          .catch(() => {
            handleError();
            dispatch({ type: 'CLEAR_UPLOAD_HISTORY' });
          });
      }
    });
  }, [nextBatch]);

  const {
    getInputProps,
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    onDropRejected,
    disabled: dropzoneDisabled || uploadInProgressOrFinished, // disabled when dropzoneDisabled === true, an upload is in progress, or if an upload finished.
    noClick: true,
    noKeyboard: true,
    accept: 'application/x-gzip', // Uploaded files must be compressed using gzip.
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_IN_BYTES,
  });

  const hideDropzoneBrowseBtn =
    (isDragAccept || acceptedFiles.length > 0) && !apiError; // Checking that there isn't an apiError set to prevent disappearance of button if image creation isn't available in a region at that moment, etc.

  const className = React.useMemo(
    () =>
      classNames({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject,
        [classes.inactive]: dropzoneDisabled || uploadInProgressOrFinished,
      }),
    [
      isDragActive,
      isDragAccept,
      isDragReject,
      dropzoneDisabled,
      uploadInProgressOrFinished,
    ]
  );

  // const UploadZoneActive =
  //   state.files.filter((upload) => upload.status !== 'QUEUED').length !== 0;

  const UploadZoneActive = state.files.length !== 0;

  const placeholder =
    !label || !region
      ? 'To upload an image, complete the required fields.'
      : 'You can browse your device to upload an image file or drop it here.';

  return (
    <div
      className={classNames({
        [classes.root]: UploadZoneActive,
      })}
    >
      <div
        {...getRootProps({
          className: `${
            dropzoneDisabled || uploadInProgressOrFinished ? 'disabled' : ''
          } ${classes.dropzone} ${className}`,
        })}
      >
        <input {...getInputProps()} placeholder={placeholder} />

        <div className={classes.fileUploads}>
          {state.files.map((upload, idx) => {
            const fileName = upload.file.name;
            return (
              <FileUpload
                key={idx}
                displayName={fileName}
                fileName={fileName}
                sizeInBytes={upload.file.size || 0}
                percentCompleted={upload.percentComplete || 0}
                overwriteNotice={upload.status === 'OVERWRITE_NOTICE'}
                dispatch={dispatch}
                error={
                  upload.status === 'ERROR' ? 'Error uploading image.' : ''
                }
                type="image"
              />
            );
          })}
        </div>

        <div
          className={classNames({
            [classes.dropzoneContent]: true,
            [classes.UploadZoneActiveButton]: UploadZoneActive,
          })}
        >
          {!UploadZoneActive && (
            <Typography variant="subtitle2" className={classes.copy}>
              {placeholder}
            </Typography>
          )}
          {!hideDropzoneBrowseBtn ? (
            <Button
              buttonType="primary"
              onClick={open}
              className={classes.uploadButton}
              disabled={dropzoneDisabled}
            >
              Browse Files
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar, React.memo);

export default enhanced(FileUploader);
