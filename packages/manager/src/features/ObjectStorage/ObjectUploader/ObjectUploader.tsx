import { getObjectURL } from '@linode/api-v4/lib/object-storage';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { useQueryClient } from 'react-query';
import { debounce } from 'throttle-debounce';

import { Button } from 'src/components/Button/Button';
import { updateBucket } from 'src/queries/objectStorage';
import { sendObjectsQueuedForUploadEvent } from 'src/utilities/analytics';
import { readableBytes } from 'src/utilities/unitConversions';

import { uploadObject } from '../requests';
import { FileUpload } from './FileUpload';
import {
  StyledDropZoneContent,
  StyledDropZoneCopy,
  StyledFileUploadsContainer,
  useStyles,
} from './ObjectUploader.styles';
import {
  MAX_FILE_SIZE_IN_BYTES,
  MAX_NUM_UPLOADS,
  MAX_PARALLEL_UPLOADS,
  ObjectUploaderAction,
  curriedObjectUploaderReducer,
  defaultState,
  pathOrFileName,
} from './reducer';
import { AxiosProgressEvent } from 'axios';

interface Props {
  bucketName: string;
  clusterId: string;
  maybeAddObjectToTable: (path: string, sizeInBytes: number) => void;
  prefix: string;
}

export const ObjectUploader = React.memo((props: Props) => {
  const { bucketName, clusterId, prefix } = props;
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
    dispatch({ files, prefix, type: 'ENQUEUE' });
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
      data: { status: 'IN_PROGRESS' },
      filesToUpdate: nextBatch.map((fileUpload) =>
        pathOrFileName(fileUpload.file)
      ),
      type: 'UPDATE_FILES',
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
          data: {
            percentComplete: 100,
            status: 'FINISHED',
          },
          filesToUpdate: [path],
          type: 'UPDATE_FILES',
        });
      };

      const handleError = () => {
        dispatch({
          data: {
            status: 'ERROR',
          },
          filesToUpdate: [path],
          type: 'UPDATE_FILES',
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
          .then(({ exists, url }) => {
            if (exists) {
              dispatch({
                fileName: path,
                type: 'NOTIFY_FILE_EXISTS',
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
        [classes.accept]: isDragAccept,
        [classes.active]: isDragActive,
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
                error={
                  upload.status === 'ERROR' ? 'Error uploading object.' : ''
                }
                dispatch={dispatch}
                displayName={upload.file.name}
                fileName={path}
                key={idx}
                overwriteNotice={upload.status === 'OVERWRITE_NOTICE'}
                percentCompleted={upload.percentComplete || 0}
                sizeInBytes={upload.file.size || 0}
                url={upload.url}
              />
            );
          })}
        </StyledFileUploadsContainer>

        <StyledDropZoneContent
          className={cx({
            [classes.UploadZoneActiveButton]: UploadZoneActive,
          })}
          data-qa-drop-zone
        >
          {!UploadZoneActive && (
            <StyledDropZoneCopy variant="subtitle2">
              You can browse your device to upload files or drop them here.
            </StyledDropZoneCopy>
          )}
          <Button
            buttonType="primary"
            className={classes.uploadButton}
            onClick={open}
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
) => (progressEvent: AxiosProgressEvent) => {
  dispatch({
    data: {
      percentComplete:
        (progressEvent.loaded / (progressEvent.total ?? 1)) * 100,
    },
    filesToUpdate: [fileName],
    type: 'UPDATE_FILES',
  });
};
