import produce from 'immer';

export const MAX_NUM_UPLOADS = 250;
export const MAX_PARALLEL_UPLOADS = 6;
export const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024 * 1024;

type FileStatus =
  | 'QUEUED'
  | 'OVERWRITE_NOTICE'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED'
  | 'ERROR';

export interface ExtendedFile {
  status: FileStatus;
  percentComplete: number;
  file: File;
  prefix: string;
  url?: string;
}

export interface ObjectUploaderState {
  files: ExtendedFile[];
  numQueued: number;
  numInProgress: number;
  numFinished: number;
  numCancelled: number;
  numErrors: number;
}

export type ObjectUploaderAction =
  | { type: 'ENQUEUE'; files: File[]; prefix: string }
  | {
      type: 'UPDATE_FILES';
      filesToUpdate: string[];
      data: Partial<ExtendedFile>;
    }
  | { type: 'NOTIFY_FILE_EXISTS'; fileName: string; url: string }
  | { type: 'CANCEL_OVERWRITE'; fileName: string }
  | { type: 'RESUME_UPLOAD'; fileName: string };

const cloneLandingReducer = (
  draft: ObjectUploaderState,
  action: ObjectUploaderAction
) => {
  switch (action.type) {
    // Add files to the queue
    case 'ENQUEUE':
      const newFiles: File[] = [];
      action.files.forEach(file => {
        // See if we're already tracking the file.
        const foundFileIdx = draft.files.findIndex(fileUpload => {
          return pathOrFileName(fileUpload.file) === pathOrFileName(file);
        });

        // If we aren't already tracking it, add it to the list of new files.
        if (foundFileIdx === -1) {
          newFiles.push(file);
        } else {
          // If we already have the file, and its status is FINISHED, CANCELLED,
          // or ERROR, we re-queue the same file. We remove the file from the
          // original list and add it to the top, so we can be sure to see it.
          const foundFileStatus = draft.files[foundFileIdx].status;
          if (
            foundFileStatus === 'FINISHED' ||
            foundFileStatus === 'CANCELLED' ||
            foundFileStatus === 'ERROR'
          ) {
            draft.files.splice(foundFileIdx, 1);
            draft.files.unshift({
              status: 'QUEUED',
              percentComplete: 0,
              file,
              prefix: action.prefix
            });
          }
        }
      });

      const extendedFiles: ExtendedFile[] = newFiles.map(file => ({
        status: 'QUEUED',
        percentComplete: 0,
        file,
        prefix: action.prefix
      }));

      draft.files = [...extendedFiles, ...draft.files];
      updateCount(draft);
      break;

    // Update files given a list of filenames and attributes to update.
    case 'UPDATE_FILES':
      action.filesToUpdate.forEach(filename => {
        const existingFile = draft.files.find(fileUpload => {
          return pathOrFileName(fileUpload.file) === filename;
        });

        if (existingFile) {
          Object.keys(action.data).forEach(key => {
            existingFile[key] = action.data[key];
          });

          // If the status has been changed, we need to update the count.
          if (action.data.status) {
            updateCount(draft);
          }
        }
      });
      break;

    case 'NOTIFY_FILE_EXISTS':
      let foundFile = draft.files.find(
        fileUpload => pathOrFileName(fileUpload.file) === action.fileName
      );
      if (foundFile) {
        foundFile.status = 'OVERWRITE_NOTICE';
        foundFile.url = action.url;
      }
      updateCount(draft);
      break;

    case 'RESUME_UPLOAD':
      foundFile = draft.files.find(
        fileUpload => pathOrFileName(fileUpload.file) === action.fileName
      );
      if (foundFile) {
        foundFile.status = 'QUEUED';
      }
      updateCount(draft);
      break;

    case 'CANCEL_OVERWRITE':
      const idx = draft.files.findIndex(
        fileUpload => pathOrFileName(fileUpload.file) === action.fileName
      );
      if (idx > -1) {
        draft.files.splice(idx, 1);
      }
      updateCount(draft);
      break;
  }
};

export const curriedObjectUploaderReducer = produce(cloneLandingReducer);

export const defaultState: ObjectUploaderState = {
  files: [],
  numQueued: 0,
  numInProgress: 0,
  numFinished: 0,
  numCancelled: 0,
  numErrors: 0
};

const updateCount = (draft: ObjectUploaderState) => {
  let numQueued = 0;
  let numInProgress = 0;
  let numFinished = 0;
  let numCancelled = 0;
  let numErrors = 0;

  draft.files.forEach(file => {
    if (file.status === 'QUEUED') {
      numQueued++;
    } else if (file.status === 'IN_PROGRESS') {
      numInProgress++;
    } else if (file.status === 'FINISHED') {
      numFinished++;
    } else if (file.status === 'CANCELLED') {
      numCancelled++;
    } else if (file.status === 'ERROR') {
      numErrors++;
    }
  });

  draft.numQueued = numQueued;
  draft.numInProgress = numInProgress;
  draft.numFinished = numFinished;
  draft.numCancelled = numCancelled;
  draft.numErrors = numErrors;
};

// The `path` key on File is bleeding edge.
// It's not part of the official spec, but all new browser versions
// support it. Using the path, we can upload directories. Fallback on the
// name if the browser doesn't support it.
export const pathOrFileName = (file: File): string =>
  (file as any).path || file.name;
