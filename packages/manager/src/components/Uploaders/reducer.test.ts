import { curriedObjectUploaderReducer as reducer } from './reducer';

import type { ObjectUploaderState } from './reducer';

describe('reducer', () => {
  const baseState: ObjectUploaderState = {
    files: [],
    numCanceled: 0,
    numErrors: 0,
    numFinished: 0,
    numInProgress: 0,
    numQueued: 0,
  };

  const file1: File = {
    arrayBuffer: vi.fn(),
    bytes: async () => new Uint8Array(),
    lastModified: 0,
    name: 'my-file1',
    size: 0,
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn(),
    type: '',
    webkitRelativePath: '',
  };

  const file2: File = {
    arrayBuffer: vi.fn(),
    bytes: async () => new Uint8Array(),
    lastModified: 0,
    name: 'my-file2',
    size: 0,
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn(),
    type: '',
    webkitRelativePath: '',
  };

  it('enqueues new files and updates the count', () => {
    const newState = reducer(baseState, {
      files: [file1, file2],
      prefix: '',
      type: 'ENQUEUE',
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
          prefix: '',
          status: 'IN_PROGRESS',
        },
      ],
    };
    const newState = reducer(initialState, {
      files: [file1],
      prefix: '',
      type: 'ENQUEUE',
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
          prefix: '',
          status: 'FINISHED',
        },
      ],
    };
    const newState = reducer(initialState, {
      files: [file1],
      prefix: '',
      type: 'ENQUEUE',
    });

    expect(newState.files[0].status).toBe('QUEUED');
  });

  it('updates files with given params and updates the count', () => {
    const newState = reducer(
      {
        ...baseState,
        files: [
          { file: file1, percentComplete: 0, prefix: '', status: 'QUEUED' },
        ],
      },
      {
        data: { status: 'IN_PROGRESS' },
        filesToUpdate: [file1.name],
        type: 'UPDATE_FILES',
      }
    );
    expect(newState.files[0].status).toBe('IN_PROGRESS');
    expect(newState.files[0].percentComplete).toBe(0);
    expect(newState.numInProgress).toBe(1);
  });
});
