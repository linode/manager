import { getObjectURL } from '@linode/api-v4/lib/object-storage';
import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { readableBytes } from 'src/utilities/unitConversions';
import { debounce } from 'throttle-debounce';
// import { uploadObject } from 'src/features/ObjectStorage/requests';
import { uploadImageFile } from 'src/features/Images/requests';
import FileUpload from 'src/features/ObjectStorage/ObjectUploader/FileUpload';
import {
  curriedObjectUploaderReducer,
  defaultState,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_NUM_UPLOADS,
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

  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  const [error, setError] = React.useState<APIError[] | undefined>();

  const dispatchAction: Dispatch = useDispatch();

  // This function is fired when objects are dropped in the upload area.
  const onDrop = (file: File) => {
    dispatchAction(
      uploadImage({
        label,
        description: description || undefined,
        region,
      })
    )
      .then((response) => {
        // console.log(response);
        const uploadUrl = response.upload_to;
        console.log(uploadUrl);

        uploadImageFile(uploadUrl, file, () => console.log('Processing...'))
          .then(() => console.log('Successfully uploaded to URL'))
          .catch(() => console.log('Error uploading to URL'));
      })
      .catch((e) => {
        console.log(e);
        setError(e);
      });
    // Look at the files queued and in-progress, along with the new files,
    // to see if we'll go over the limit.
    if (state.numInProgress + state.numQueued + 1 > MAX_NUM_UPLOADS) {
      props.enqueueSnackbar(`Upload up to ${MAX_NUM_UPLOADS} files at a time`, {
        variant: 'error',
      });
      return;
    }

    // @analytics
    // sendObjectsQueuedForUploadEvent(files.length);

    // We bind each file to the prefix at the time of onDrop. The prefix could
    // change later, if the user navigates to a different folder before the
    // upload is complete.
    const files = [file];
    const prefix = '';
    dispatch({ type: 'ENQUEUE', files, prefix });
  };

  // This function will be called for dropped files that are over the max size.
  const onDropRejected = (files: File[]) => {
    let errorMessage = `Max file size (${
      readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
    }) exceeded`;

    if (files.length > 1) {
      errorMessage += ' for some files';
    }

    props.enqueueSnackbar(errorMessage, {
      variant: 'error',
    });
  };

  const nextBatch = React.useMemo(() => {
    if (state.numQueued === 0 || state.numInProgress >= MAX_PARALLEL_UPLOADS) {
      return [];
    }

    const queuedUploads = state.files.filter(
      (upload) => upload.status === 'QUEUED'
    );

    return queuedUploads.slice(0, MAX_PARALLEL_UPLOADS - state.numInProgress);
  }, [state.numQueued, state.numInProgress]);

  //   const debouncedGetBucket = React.useRef(
  //     debounce(400, false, () =>
  //       props
  //         .getBucket({ cluster: props.clusterId, label: props.bucketName })
  //         // It's OK to swallow the error here, since this request is for a silent UI update.
  //         .catch((_) => null)
  //     )
  //   ).current;

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
      //       const isInFolder = path.startsWith('/');

      //       // We want to upload the object to the current "folder" the user is
      //       // viewing, so we prepend the file name with the prefix. If the object
      //       // being uploaded is itself in a folder, we drop the leading slash.
      //       //
      //       // We need to use the prefix on each object (bound at onDrop) because the
      //       // prefix from the parent might have changed if the user has navigated to
      //       // a different folder.
      //       const fullObjectName =
      //         fileUpload.prefix + (isInFolder ? path.substring(1) : path);

      const onUploadProgress = onUploadProgressFactory(dispatch, path);

      const handleSuccess = () => {
        //         // Request the Bucket again so the updated size is reflected on the Bucket Landing page.
        //         // This request is debounced since many Objects can be uploaded at once.
        //         debouncedGetBucket();

        //         // We may want to add the object to the table, depending on the prefix
        //         // the user is currently viewing. Do this in the parent, which has the
        //         // current prefix in scope.
        //         props.maybeAddObjectToTable(fullObjectName, file.size);

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

      // If we've already gotten the URL (i.e. we've confirmed this file should
      // be overwritten) we can go ahead and upload it.
      if (fileUpload.url) {
        uploadImageFile(fileUpload.url, file, onUploadProgress)
          .then((_) => handleSuccess())
          .catch((_) => handleError());
      } else {
        handleError();
        console.log('Error: need to handle case of no URL');
        //   // Otherwise, we need to make an API request to get the URL.
        //   dispatchAction(
        //     uploadImage({
        //       label,
        //       description: description || undefined,
        //       region,
        //     })
        //   )
        //   getObjectURL(clusterId, bucketName, fullObjectName, 'PUT', {
        //     content_type: file.type,
        //   })
        //     .then(({ url, exists }) => {
        //       if (exists) {
        //         dispatch({
        //           type: 'NOTIFY_FILE_EXISTS',
        //           fileName: path,
        //           url,
        //         });
        //         return;
        //       }

        //       return uploadImageFile(url, file, onUploadProgress)
        //         .then((_) => handleSuccess())
        //         .catch((_) => handleError());
        //     })
        //     .catch((_) => handleError());
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
            const path = (upload.file as any).path || upload.file.name;
            return (
              <FileUpload
                key={idx}
                displayName={upload.file.name}
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
