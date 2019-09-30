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
import { truncateMiddle } from 'src/utilities/truncate';
import { throttle } from 'throttle-debounce';
import { uploadObject } from '../requests';
import FileUpload from './FileUpload';
import {
  curriedObjectUploaderReducer,
  defaultState,
  ExtendedFile,
  ObjectUploaderAction
} from './reducer';

const MAX_NUM_UPLOADS = 250;
const MAX_PARALLEL_UPLOADS = 6;
const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024 * 1024;

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

interface FileUpload {
  name: string;
  sizeInBytes: number;
  completedPercentage: number;
  inProgress: boolean;
  meta: File;
  error?: string;
}

const ObjectUploader: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, update, prefix } = props;

  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  const previousCompletion = usePrevious(state.allUploadsFinished);
  React.useEffect(() => {
    if (previousCompletion === false && state.allUploadsFinished === true) {
      update();
    }
  }, [state.allUploadsFinished]);

  const onDrop = async (files: File[]) => {
    // @todo: GA event
    if (state.numInProgress + files.length > MAX_NUM_UPLOADS) {
      props.enqueueSnackbar('Upload up to 100 files at a time.', {
        variant: 'error'
      });
      return;
    }

    dispatch({ type: 'ENQUEUE', files });
  };

  const queuedUploads = React.useMemo(() => {
    return state.files.filter(upload => upload.status === 'QUEUED');
  }, [state.numQueued]);

  const nextBatch = React.useMemo(() => {
    if (state.numQueued === 0) {
      return [];
    }

    if (state.numInProgress < MAX_PARALLEL_UPLOADS) {
      return queuedUploads.slice(0, MAX_PARALLEL_UPLOADS - state.numInProgress);
    }
    return [];
  }, [state.numQueued, state.numInProgress, queuedUploads]);

  React.useEffect(() => {
    if (nextBatch.length === 0) {
      return;
    }

    dispatch({ type: 'SET_IN_PROGRESS', files: nextBatch });

    const getURLAndUploadObject = (fileUpload: ExtendedFile) => {
      const { file } = fileUpload;

      // We want to upload the object to the current "folder", so we prepend the
      // file name with the prefix.

      // The `path` key on File is bleeding edge. It's not part of the
      // official spec, but all new browser versions support it. Using the
      // path, we can upload directories. Fallback on the name if the browser
      // doesn't support it.
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
            type: 'UPDATE_FILE',
            data: {
              fileName: file.name,
              percentComplete: 100,
              status: 'FINISHED'
            }
          });
        })
        .catch(err => {
          handleError(dispatch, file.name);
          return Promise.reject();
        });
    };

    const requests = nextBatch.map(fileUpload => {
      return getURLAndUploadObject(fileUpload);
    });

    Promise.all(requests)
      .then(() => {
        dispatch({ type: 'FINISH_BATCH' });
      })
      .catch(() => {
        // @todo: better error handling.
      });
  }, [nextBatch]);

  const { width } = useWindowDimensions();

  // These max widths and breakpoints are based on trial-and-error.
  const truncationMaxWidth = width < 1920 ? 20 : 30;

  const onDropRejected = (files: File[]) => {
    // @todo: better error handling.
    props.enqueueSnackbar('Max file size exceeded (5 GB).', {
      variant: 'error'
    });
  };

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
          {state.files.map((upload, idx) => {
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
) =>
  throttle(300, (progressEvent: ProgressEvent) => {
    dispatch({
      type: 'UPDATE_FILE',
      data: {
        fileName,
        percentComplete: (progressEvent.loaded / progressEvent.total) * 100
      }
    });
  });

const handleError = (
  dispatch: (value: ObjectUploaderAction) => void,
  fileName: string
) => {
  dispatch({
    type: 'UPDATE_FILE',
    data: {
      fileName,
      status: 'ERROR'
    }
  });
};
