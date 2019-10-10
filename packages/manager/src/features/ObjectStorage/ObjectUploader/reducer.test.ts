import {
  curriedObjectUploaderReducer as reducer,
  ObjectUploaderState
} from './reducer';

describe('reducer', () => {
  const baseState: ObjectUploaderState = {
    files: [],
    numQueued: 0,
    numInProgress: 0,
    numFinished: 0,
    numCancelled: 0,
    numErrors: 0
  };

  const file1: File = {
    name: 'my-file1',
    lastModified: 0,
    size: 0,
    type: '',
    slice: jest.fn()
  };
  const file2: File = {
    name: 'my-file2',
    lastModified: 0,
    size: 0,
    type: '',
    slice: jest.fn()
  };

  it('enqueues new files and updates the count', () => {
    const newState = reducer(baseState, {
      type: 'ENQUEUE',
      files: [file1, file2],
      prefix: ''
    });
    expect(newState.files).toHaveLength(2);
    expect(newState.numQueued).toBe(2);
  });

  it('does not update files that are in progress', () => {
    const initialState: ObjectUploaderState = {
      ...baseState,
      files: [
        {
          file: file1,
          percentComplete: 0,
          status: 'IN_PROGRESS',
          prefix: ''
        }
      ]
    };
    const newState = reducer(initialState, {
      type: 'ENQUEUE',
      files: [file1],
      prefix: ''
    });

    expect(newState.files[0].status).toBe('IN_PROGRESS');
  });

  it('update files that are finished', () => {
    const initialState: ObjectUploaderState = {
      ...baseState,
      files: [
        {
          file: file1,
          percentComplete: 0,
          status: 'FINISHED',
          prefix: ''
        }
      ]
    };
    const newState = reducer(initialState, {
      type: 'ENQUEUE',
      files: [file1],
      prefix: ''
    });

    expect(newState.files[0].status).toBe('QUEUED');
  });

  it('updates files with given params and updates the count', () => {
    const newState = reducer(
      {
        ...baseState,
        files: [
          { status: 'QUEUED', percentComplete: 0, file: file1, prefix: '' }
        ]
      },
      {
        type: 'UPDATE_FILES',
        filesToUpdate: [file1.name],
        data: { status: 'IN_PROGRESS' }
      }
    );
    expect(newState.files[0].status).toBe('IN_PROGRESS');
    expect(newState.files[0].percentComplete).toBe(0);
    expect(newState.numInProgress).toBe(1);
  });
});
