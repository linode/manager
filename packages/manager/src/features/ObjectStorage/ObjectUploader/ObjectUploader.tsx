import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import CloudUpload from 'src/assets/icons/cloudUpload.svg';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { usePrevious } from 'src/hooks/usePrevious';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { getObjectURL } from 'src/services/objectStorage/objects';
import { sendObjectsQueuedForUploadEvent } from 'src/utilities/ga';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import { uploadObject } from '../requests';
import FileUpload from './FileUpload';
import {
  curriedObjectUploaderReducer,
  defaultState,
  ExtendedFile,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_NUM_UPLOADS,
  MAX_PARALLEL_UPLOADS,
  ObjectUploaderAction
} from './reducer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      position: 'sticky',
      top: theme.spacing(3),
      height: `calc(100vh - (160px + ${theme.spacing(20)}px))`,
      marginLeft: theme.spacing(4)
    }
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    borderWidth: 1,
    borderRadius: 6,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    outline: 'none',
    height: '100%',
    transition: theme.transitions.create(['border-color', 'background-color']),
    overflow: 'auto'
  },
  copy: {
    color: theme.palette.primary.main,
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(10)
    }
  },
  active: {
    // The `active` class active when a user is hovering over the dropzone.
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.color.white,
    '& $uploadButton': {
      opacity: 0.5
    }
  },
  accept: {
    // The `accept` class active when a user is hovering over the dropzone
    // with files that will be accepted (based on file size, number of files).
    borderColor: theme.palette.primary.light
  },
  reject: {
    // The `reject` class active when a user is hovering over the dropzone
    // with files that will be rejected (based on file size, number of files).
    borderColor: theme.color.red
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2)
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(8)
    }
  },
  fileUploads: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  uploadButton: {
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.only('lg')]: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5)
    },
    [theme.breakpoints.down('lg')]: {
      marginTop: theme.spacing(2)
    }
  }
}));

interface Props {
  clusterId: string;
  bucketName: string;
  update: () => void;
  prefix: string;
}

type CombinedProps = Props & WithSnackbarProps;

const ObjectUploader: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, update, prefix } = props;

  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  // Keep track of the previous value of `allUploadsFinished` using refs.
  const previousCompletion = usePrevious(state.allUploadsFinished);

  React.useEffect(() => {
    // Once a batch of uploads is complete, update the object list.
    if (previousCompletion === false && state.allUploadsFinished === true) {
      update();
    }
  }, [state.allUploadsFinished]);

  // This function is fired when objects are dropped in the upload area.
  const onDrop = async (files: File[]) => {
    // Look at the files queued and in-progress, along with the new files,
    // to see if we'll go over the limit.
    if (
      state.numInProgress + state.numQueued + files.length >
      MAX_NUM_UPLOADS
    ) {
      props.enqueueSnackbar(`Upload up to ${MAX_NUM_UPLOADS} files at a time`, {
        variant: 'error'
      });
      return;
    }

    // @analytics
    sendObjectsQueuedForUploadEvent(files.length);

    dispatch({ type: 'ENQUEUE', files });
  };

  // This function will be called when dropped files that are over the max size.
  const onDropRejected = (files: File[]) => {
    files.forEach(file => {
      props.enqueueSnackbar(
        `Max file size (${
          readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
        }) exceeded for file: ${file.name}`,
        {
          variant: 'error'
        }
      );
    });
  };

  const queuedUploads = React.useMemo(() => {
    return state.files.filter(upload => upload.status === 'QUEUED');
  }, [state.numQueued]);

  const nextBatch = React.useMemo(() => {
    if (state.numQueued === 0 || state.numInProgress >= MAX_PARALLEL_UPLOADS) {
      return [];
    }

    return queuedUploads.slice(0, MAX_PARALLEL_UPLOADS - state.numInProgress);
  }, [state.numQueued, state.numInProgress, queuedUploads]);

  // When `nextBatch` changes, upload the files.
  React.useEffect(() => {
    if (nextBatch.length === 0) {
      return;
    }

    // Set status as "IN_PROGRESS" for each file.
    dispatch({
      type: 'UPDATE_FILES',
      filesToUpdate: nextBatch.map(fileUpload => fileUpload.file.name),
      data: { status: 'IN_PROGRESS' }
    });

    const promises = nextBatch.map(fileUpload =>
      getURLAndUploadObject(fileUpload, dispatch, clusterId, bucketName, prefix)
    );

    Promise.all(promises)
      .then(() => {
        dispatch({ type: 'FINISH_BATCH' });
      })
      .catch(() => {
        // Errors for individual files are handled in the mapped promises.
        dispatch({ type: 'FINISH_BATCH' });
      });
  }, [nextBatch]);

  const { width } = useWindowDimensions();

  // These max widths and breakpoints are based on trial-and-error.
  const truncationMaxWidth = width < 1920 ? 20 : 30;

  const {
    getInputProps,
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    onDropRejected,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_FILE_SIZE_IN_BYTES
  });

  const className = React.useMemo(
    () =>
      classNames({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject
      }),
    [isDragActive, isDragAccept, isDragReject]
  );

  return (
    <div className={classes.root}>
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input {...getInputProps()} />

        <div className={classes.fileUploads}>
          {state.files.slice(0, MAX_NUM_UPLOADS).map((upload, idx) => {
            return (
              <FileUpload
                key={idx}
                name={truncateMiddle(
                  upload.file.name || '',
                  truncationMaxWidth
                )}
                sizeInBytes={upload.file.size || 0}
                percentCompleted={upload.percentComplete || 0}
                error={
                  upload.status === 'ERROR' ? 'Error uploading object.' : ''
                }
              />
            );
          })}
        </div>

        {state.files.length === 0 && (
          <div className={classes.dropzoneContent}>
            <Hidden xsDown>
              <CloudUpload />
            </Hidden>
            <Typography variant="subtitle2" className={classes.copy}>
              You can browse your device to upload files or drop them here.
            </Typography>
            <Button
              buttonType="primary"
              onClick={open}
              className={classes.uploadButton}
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default withSnackbar(ObjectUploader);

const onUploadProgressFactory = (
  dispatch: (value: ObjectUploaderAction) => void,
  fileName: string
) => (progressEvent: ProgressEvent) => {
  dispatch({
    type: 'UPDATE_FILES',
    filesToUpdate: [fileName],
    data: {
      percentComplete: (progressEvent.loaded / progressEvent.total) * 100
    }
  });
};

const getURLAndUploadObject = (
  fileUpload: ExtendedFile,
  dispatch: React.Dispatch<ObjectUploaderAction>,
  clusterId: string,
  bucketName: string,
  prefix: string
) => {
  const { file } = fileUpload;

  // We want to upload the object to the current "folder", so we prepend the
  // file name with the prefix. The `path` key on File is bleeding edge.
  // It's not part of the official spec, but all new browser versions
  // support it. Using the path, we can upload directories. Fallback on the
  // name if the browser doesn't support it.
  const path = (file as any).path || file.name;
  const fullObjectName = prefix + path;

  return getObjectURL(clusterId, bucketName, fullObjectName, 'PUT', {
    content_type: file.type
  })
    .then(({ url }) => {
      const onUploadProgress = onUploadProgressFactory(dispatch, file.name);
      return uploadObject(url, file, onUploadProgress);
    })
    .then(() => {
      dispatch({
        type: 'UPDATE_FILES',
        filesToUpdate: [file.name],
        data: {
          percentComplete: 100,
          status: 'FINISHED'
        }
      });
    })
    .catch(err => {
      dispatch({
        type: 'UPDATE_FILES',
        filesToUpdate: [file.name],
        data: {
          status: 'ERROR'
        }
      });
      return Promise.reject();
    });
};
