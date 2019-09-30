import produce from 'immer';

/**
 * TYPES
 */

type FileStatus = 'QUEUED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' | 'ERROR';

export interface ExtendedFile {
  status: FileStatus;
  percentComplete: number;
  file: File;
}

export interface ObjectUploaderState {
  files: ExtendedFile[];
  numQueued: number;
  numInProgress: number;
  numFinished: number;
  numCancelled: number;
  numErrors: number;
  allUploadsFinished: boolean;
}

export type ObjectUploaderAction =
  | { type: 'ENQUEUE'; files: File[] }
  | { type: 'SET_IN_PROGRESS'; files: ExtendedFile[] }
  | { type: 'UPDATE_FILE'; data: { fileName: string } & Partial<ExtendedFile> }
  | { type: 'FINISH_BATCH' };

const cloneLandingReducer = (
  draft: ObjectUploaderState,
  action: ObjectUploaderAction
) => {
  switch (action.type) {
    case 'ENQUEUE':
      // Filter out files that are already queued or in progress
      const filteredFiles = action.files.filter(file => {
        const foundFile = draft.files.find(
          upload => upload.file.name === file.name
        );
        return (
          !foundFile ||
          (foundFile.status !== 'IN_PROGRESS' && foundFile.status !== 'QUEUED')
        );
      });

      const extendedFiles: ExtendedFile[] = filteredFiles.map(file => ({
        status: 'QUEUED',
        percentComplete: 0,
        file
      }));
      draft.files = [...extendedFiles, ...draft.files];
      updateCount(draft);
      draft.allUploadsFinished = false;
      break;

    case 'SET_IN_PROGRESS':
      action.files.forEach(file => {
        // I was getting a shadowed-variable-name error here (???)
        // tslint:disable-next-line
        const idx = draft.files.findIndex(
          prevUpload => prevUpload.file.name === file.file.name
        );
        if (idx > -1) {
          draft.files[idx].status = 'IN_PROGRESS';
        }
      });
      updateCount(draft);
      break;

    case 'UPDATE_FILE':
      const idx = draft.files.findIndex(
        prevUpload => prevUpload.file.name === action.data.fileName
      );
      if (idx > -1) {
        draft.files[idx] = { ...draft.files[idx], ...action.data };

        // If the status has been changed, we need to update the count.
        if (action.data.status) {
          updateCount(draft);
        }
      }
      break;

    case 'FINISH_BATCH':
      updateCount(draft);
      if (draft.numInProgress === 0) {
        draft.allUploadsFinished = true;
      }
  }
};

export const curriedObjectUploaderReducer = produce(cloneLandingReducer);

export const defaultState: ObjectUploaderState = {
  files: [],
  numQueued: 0,
  numInProgress: 0,
  numFinished: 0,
  numCancelled: 0,
  numErrors: 0,
  allUploadsFinished: false
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
