import * as React from 'react';
import Button from 'src/components/Button';
import { debounce } from 'throttle-debounce';
import { FileUpload } from './FileUpload';
import { getObjectURL } from '@linode/api-v4/lib/object-storage';
import { readableBytes } from 'src/utilities/unitConversions';
import { sendObjectsQueuedForUploadEvent } from 'src/utilities/analytics';
import { updateBucket } from 'src/queries/objectStorage';
import { uploadObject } from '../requests';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import {
  curriedObjectUploaderReducer,
  defaultState,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_NUM_UPLOADS,
  MAX_PARALLEL_UPLOADS,
  ObjectUploaderAction,
  pathOrFileName,
} from './reducer';
import {
  StyledDropZoneContent,
  StyledDropZoneCopy,
  StyledFileUploadsContainer,
  useStyles,
} from './ObjectUploader.styles';

interface Props {
  clusterId: string;
  bucketName: string;
  prefix: string;
  maybeAddObjectToTable: (path: string, sizeInBytes: number) => void;
}

export const ObjectUploader = React.memo((props: Props) => {
  const { clusterId, bucketName, prefix } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { classes, cx } = useStyles();
  const queryClient = useQueryClient();
  const [state, dispatch] = React.useReducer(
    curriedObjectUploaderReducer,
    defaultState
  );

  // This function is fired when objects are dropped in the upload area.
  const onDrop = (files: File[]) => {
    // Look at the files queued and in-progress, along with the new files,
    // to see if we'll go over the limit.
    if (
      state.numInProgress + state.numQueued + files.length >
      MAX_NUM_UPLOADS
    ) {
      enqueueSnackbar(`Upload up to ${MAX_NUM_UPLOADS} files at a time`, {
        variant: 'error',
      });
      return;
    }

    // @analytics
    sendObjectsQueuedForUploadEvent(files.length);

    // We bind each file to the prefix at the time of onDrop. The prefix could
    // change later, if the user navigates to a different folder before the
    // upload is complete.
    dispatch({ type: 'ENQUEUE', files, prefix });
  };

  // This function will be called when dropped files that are over the max size.
  const onDropRejected = (files: FileRejection[]) => {
    let errorMessage = `Max file size (${
      readableBytes(MAX_FILE_SIZE_IN_BYTES).formatted
    }) exceeded`;

    if (files.length > 1) {
      errorMessage += ' for some files';
    }

    enqueueSnackbar(errorMessage, {
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

  // If a user uploads many files at once, we don't want to refetch bucket stats for every object.
  // We debounce this request to prevent unnecessary fetches.
  const debouncedGetBucket = React.useRef(
    debounce(3000, false, () =>
      updateBucket(clusterId, bucketName, queryClient)
    )
  ).current;

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
      const isInFolder = path.startsWith('/');

      // We want to upload the object to the current "folder" the user is
      // viewing, so we prepend the file name with the prefix. If the object
      // being uploaded is itself in a folder, we drop the leading slash.
      //
      // We need to use the prefix on each object (bound at onDrop) because the
      // prefix from the parent might have changed if the user has navigated to
      // a different folder.
      const fullObjectName =
        fileUpload.prefix + (isInFolder ? path.substring(1) : path);

      const onUploadProgress = onUploadProgressFactory(dispatch, path);

      const handleSuccess = () => {
        // Request the Bucket again so the updated size is reflected on the Bucket Landing page.
        // This request is debounced since many Objects can be uploaded at once.
        debouncedGetBucket();

        // We may want to add the object to the table, depending on the prefix
        // the user is currently viewing. Do this in the parent, which has the
        // current prefix in scope.
        props.maybeAddObjectToTable(fullObjectName, file.size);

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
        uploadObject(fileUpload.url, file, onUploadProgress)
          .then((_) => handleSuccess())
          .catch((_) => handleError());
      } else {
        // Otherwise, we need to make an API request to get the URL.
        getObjectURL(clusterId, bucketName, fullObjectName, 'PUT', {
          content_type: file.type,
        })
          .then(({ url, exists }) => {
            if (exists) {
              dispatch({
                type: 'NOTIFY_FILE_EXISTS',
                fileName: path,
                url,
              });
              return;
            }

            return uploadObject(url, file, onUploadProgress)
              .then((_) => handleSuccess())
              .catch((_) => handleError());
          })
          .catch((_) => handleError());
      }
    });
  }, [nextBatch]);

  const {
    getInputProps,
    getRootProps,
    isDragAccept,
    isDragActive,
    isDragReject,
    open,
  } = useDropzone({
    maxSize: MAX_FILE_SIZE_IN_BYTES,
    noClick: true,
    noKeyboard: true,
    onDrop,
    onDropRejected,
  });

  const className = React.useMemo(
    () =>
      cx({
        [classes.active]: isDragActive,
        [classes.accept]: isDragAccept,
        [classes.reject]: isDragReject,
      }),
    [isDragActive, isDragAccept, isDragReject]
  );

  const UploadZoneActive = state.files.length !== 0;

  return (
    <div
      className={cx({
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

        <StyledFileUploadsContainer>
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
        </StyledFileUploadsContainer>

        <StyledDropZoneContent
          data-qa-drop-zone
          className={cx({
            [classes.UploadZoneActiveButton]: UploadZoneActive,
          })}
        >
          {!UploadZoneActive && (
            <StyledDropZoneCopy variant="subtitle2">
              You can browse your device to upload files or drop them here.
            </StyledDropZoneCopy>
          )}
          <Button
            buttonType="primary"
            onClick={open}
            className={classes.uploadButton}
          >
            Browse Files
          </Button>
        </StyledDropZoneContent>
      </div>
    </div>
  );
});

export const onUploadProgressFactory = (
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
