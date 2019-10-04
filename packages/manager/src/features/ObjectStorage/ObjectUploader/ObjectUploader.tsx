import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { compose } from 'recompose';
import CloudUpload from 'src/assets/icons/cloudUpload.svg';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
  MAX_FILE_SIZE_IN_BYTES,
  MAX_NUM_UPLOADS,
  MAX_PARALLEL_UPLOADS,
  ObjectUploaderAction,
  pathOrFileName
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
  rootActive: {
    [theme.breakpoints.down('md')]: {
      paddingBottom: 60,
      position: 'relative'
    },
    [theme.breakpoints.up('lg')]: {
      minHeight: 200,
      height: `calc(100vh - (220px + ${theme.spacing(20)}px))`
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
    minHeight: 200,
    transition: theme.transitions.create(['border-color', 'background-color']),
    overflow: 'auto'
  },
  copy: {
    color: theme.palette.primary.main,
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2)
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
      padding: `${theme.spacing(4)}px ${theme.spacing(8)}px`
    }
  },
  UploadZoneActiveButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: theme.palette.divider,
    bottom: -70,
    left: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`,
    padding: 0,
    '& $uploadButton': {
      marginTop: 0
    },
    [theme.breakpoints.down('md')]: {
      bottom: 0
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
  prefix: string;
  addOneFile: (fileName: string, sizeInBytes: number) => void;
  addOneFolder: (folderName: string) => void;
}

type CombinedProps = Props & WithSnackbarProps;

const ObjectUploader: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName, prefix, addOneFile, addOneFolder } = props;

  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

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

  const nextBatch = React.useMemo(() => {
    if (state.numQueued === 0 || state.numInProgress >= MAX_PARALLEL_UPLOADS) {
      return [];
    }

    const queuedUploads = state.files.filter(
      upload => upload.status === 'QUEUED'
    );

    return queuedUploads.slice(0, MAX_PARALLEL_UPLOADS - state.numInProgress);
  }, [state.numQueued, state.numInProgress]);

  // When `nextBatch` changes, upload the files.
  React.useEffect(() => {
    if (nextBatch.length === 0) {
      return;
    }

    // Set status as "IN_PROGRESS" for each file.
    dispatch({
      type: 'UPDATE_FILES',
      filesToUpdate: nextBatch.map(fileUpload =>
        pathOrFileName(fileUpload.file)
      ),
      data: { status: 'IN_PROGRESS' }
    });

    nextBatch.forEach(fileUpload => {
      const { file } = fileUpload;

      const path = pathOrFileName(fileUpload.file);
      const isInFolder = path.startsWith('/');

      // We want to upload the object to the current "folder" the user is
      // viewing, so we prepend the file name with the prefix. If the object
      // being uploaded is itself in a folder, we drop the leading slash.
      const fullObjectName = prefix + (isInFolder ? path.substring(1) : path);

      const onUploadProgress = onUploadProgressFactory(dispatch, path);

      const handleSuccess = () => {
        if (isInFolder) {
          // Determine if the path is a nested folder (2+ levels deep). If so,
          // add a folder to the object table.
          const pathAsArray = path.split('/');
          if (pathAsArray.length <= 3) {
            const folderName = pathAsArray[1] || '';
            addOneFolder(prefix + folderName + '/');
          }
        } else {
          addOneFile(fullObjectName, file.size);
        }

        dispatch({
          type: 'UPDATE_FILES',
          filesToUpdate: [path],
          data: {
            percentComplete: 100,
            status: 'FINISHED'
          }
        });
      };

      const handleError = () => {
        dispatch({
          type: 'UPDATE_FILES',
          filesToUpdate: [path],
          data: {
            status: 'ERROR'
          }
        });
      };

      // If we've already gotten the URL (i.e. we've confirmed this file should
      // be overwritten) we can go ahead and upload it.
      if (fileUpload.url) {
        uploadObject(fileUpload.url, file, onUploadProgress)
          .then(_ => handleSuccess())
          .catch(_ => handleError());
      } else {
        // Otherwise, we need to make an API request to get the URL.
        getObjectURL(clusterId, bucketName, fullObjectName, 'PUT', {
          content_type: file.type
        })
          .then(({ url, exists }) => {
            if (exists) {
              dispatch({
                type: 'NOTIFY_FILE_EXISTS',
                fileName: path,
                url
              });
              return;
            }

            return uploadObject(url, file, onUploadProgress)
              .then(_ => handleSuccess())
              .catch(_ => handleError());
          })
          .catch(_ => handleError());
      }
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

  const UploadZoneActive = state.files.length !== 0;

  return (
    <div
      className={classNames({
        [classes.root]: true,
        [classes.rootActive]: UploadZoneActive
      })}
    >
      <div {...getRootProps({ className: `${classes.dropzone} ${className}` })}>
        <input {...getInputProps()} />

        <div className={classes.fileUploads}>
          {state.files.map((upload, idx) => {
            const path = (upload.file as any).path || upload.file.name;
            return (
              <FileUpload
                key={idx}
                displayName={truncateMiddle(
                  upload.file.name || '',
                  truncationMaxWidth
                )}
                fileName={path}
                sizeInBytes={upload.file.size || 0}
                percentCompleted={upload.percentComplete || 0}
                overwriteNotice={upload.status === 'OVERWRITE_NOTICE'}
                url={upload.url}
                dispatch={dispatch}
                error={
                  upload.status === 'ERROR' ? 'Error uploading object.' : ''
                }
              />
            );
          })}
        </div>

        <div
          className={classNames({
            [classes.dropzoneContent]: true,
            [classes.UploadZoneActiveButton]: UploadZoneActive
          })}
        >
          {!UploadZoneActive && (
            <Hidden xsDown>
              <CloudUpload />
            </Hidden>
          )}
          {!UploadZoneActive && (
            <Typography variant="subtitle2" className={classes.copy}>
              You can browse your device to upload files or drop them here.
            </Typography>
          )}
          <Button
            buttonType="primary"
            onClick={open}
            className={classNames({
              [classes.uploadButton]: true
            })}
          >
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withSnackbar,
  React.memo
);

export default enhanced(ObjectUploader);

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
