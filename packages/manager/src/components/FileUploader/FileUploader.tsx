import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { readableBytes } from 'src/utilities/unitConversions';
import { uploadImageFile } from 'src/features/Images/requests';
import FileUpload from 'src/features/ObjectStorage/ObjectUploader/FileUpload';
import {
  curriedObjectUploaderReducer,
  defaultState,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_PARALLEL_UPLOADS,
  ObjectUploaderAction,
  pathOrFileName,
} from 'src/features/ObjectStorage/ObjectUploader/reducer';
import { Dispatch } from 'src/hooks/types';
import { useDispatch } from 'react-redux';
import { uploadImage } from 'src/store/image/image.requests';
import { APIError } from '@linode/api-v4/lib/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: 60,
    position: 'relative',
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderColor: theme.palette.primary.main,
    borderRadius: 6,
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
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
      marginLeft: theme.spacing(),
    },
  },
  active: {
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.color.white,
    '& $uploadButton': {
      opacity: 0.5,
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
    color: theme.palette.primary.main,
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
}

type CombinedProps = Props & WithSnackbarProps;

const FileUploader: React.FC<CombinedProps> = (props) => {
  const { label, description, region } = props;

  const [error, setError] = React.useState<APIError[] | undefined>();
  const [uploadToURL, setUploadToURL] = React.useState<string>('');

  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  const dispatchAction: Dispatch = useDispatch();

  // This function is fired when files are dropped in the upload area.
  const onDrop = (files: File[]) => {
    const prefix = '';
    dispatch({ type: 'ENQUEUE', files, prefix });
  };

  // This function will be called when the user drops files that are either over the max size or are not .gz files.
  const onDropRejected = (files: File[]) => {
    const fileSizeErrorMessage = `Max file size (${
      readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
    }) exceeded`;

    const fileTypeErrorMessage =
      'Only raw disk images (.img) compressed using gzip (.gz) can be uploaded.';

    const wrongFileType = files[0].type !== 'application/x-gzip';

    if (wrongFileType) {
      props.enqueueSnackbar(fileTypeErrorMessage, {
        variant: 'error',
      });
    } else {
      props.enqueueSnackbar(fileSizeErrorMessage, {
        variant: 'error',
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

  // When `nextBatch` changes, upload the files.
  React.useEffect(() => {
    if (nextBatch.length === 0) {
      return;
    }

    // Set status as "IN_PROGRESS" for each file.
    dispatch({
      type: 'UPDATE_FILES',
      filesToUpdate: nextBatch.map((fileUpload) =>
        pathOrFileName(fileUpload.file)
      ),
      data: { status: 'IN_PROGRESS' },
    });

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
      };

      const handleError = () => {
        dispatch({
          type: 'UPDATE_FILES',
          filesToUpdate: [path],
          data: {
            status: 'ERROR',
          },
        });
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

            uploadImageFile(response.upload_to, file, onUploadProgress) // response.upload_to used here instead of uploadToURL b/c of race condition
              .then(() => handleSuccess())
              .catch(() => handleError());
          })
          .catch((e) => {
            console.log(e);
            setError(e);
          });
      } else {
        // Overwrite any file that was previously uploaded to the upload_to URL.
        uploadImageFile(uploadToURL, file, onUploadProgress)
          .then(() => handleSuccess())
          .catch(() => handleError());
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
  } = useDropzone({
    onDrop,
    onDropRejected,
    noClick: true,
    noKeyboard: true,
    accept: '.gz', // Uploaded files must be compressed using the gzip compression algorithm.
    maxSize: MAX_FILE_SIZE_IN_BYTES,
  });

  const className = React.useMemo(
    () =>
      classNames({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject,
      }),
    [isDragActive, isDragAccept, isDragReject]
  );

  const UploadZoneActive = state.files.length !== 0;

  return (
    <div
      className={classNames({
        [classes.root]: UploadZoneActive,
      })}
    >
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input
          {...getInputProps()}
          placeholder={
            'You can browse your device to upload files or drop them here.'
          }
        />

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
              You can browse your device to upload files or drop them here.
            </Typography>
          )}
          <Button
            buttonType="primary"
            onClick={open}
            className={classes.uploadButton}
            disabled={state.numInProgress > 0}
          >
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar, React.memo);

export default enhanced(FileUploader);

const onUploadProgressFactory = (
  dispatch: (value: ObjectUploaderAction) => void,
  fileName: string
) => (progressEvent: ProgressEvent) => {
  dispatch({
    type: 'UPDATE_FILES',
    filesToUpdate: [fileName],
    data: {
      percentComplete: (progressEvent.loaded / progressEvent.total) * 100,
    },
  });
};
