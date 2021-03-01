import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { GetAllData } from 'src/utilities/getAll';
import { isType } from 'typescript-fsa';
import { getAllBucketsForAllClustersActions as actions } from './bucket.actions';
import {
  gatherDataAndErrors,
  getAllBucketsFromClusters,
} from './bucket.requests';
import { BucketError } from './types';

const mockStore = configureMockStore([thunk]);

const usEast1 = 'us-east-1';
const euCentral1 = 'eu-central-1';

jest.mock('@linode/api-v4/lib/object-storage', () => {
  const buckets1 = objectStorageBucketFactory.buildList(1, {
    cluster: usEast1,
  });
  const buckets2 = objectStorageBucketFactory.buildList(1, {
    cluster: euCentral1,
  });
  return {
    getBucketsInCluster: jest
      .fn()
      // First test
      .mockResolvedValueOnce({ data: buckets1, results: 1 })
      .mockResolvedValueOnce({ data: buckets2, results: 1 })
      // Second test
      .mockResolvedValueOnce({ data: buckets1, results: 1 })
      .mockRejectedValueOnce([{ reason: 'An error occurred' }]),
  };
});

describe('getAllBucketsFromAllClusters', () => {
  it('handles successes', async () => {
    const store = mockStore();
    await store.dispatch(
      getAllBucketsFromClusters([usEast1, euCentral1]) as any
    );
    const [firstAction, secondAction] = store.getActions();
    expect(isType(firstAction, actions.started)).toBe(true);
    expect(isType(secondAction, actions.done)).toBe(true);
    expect(secondAction.payload.result).toHaveLength(2);
  });
  it('handles errors', async () => {
    const store = mockStore();
    await store.dispatch(
      getAllBucketsFromClusters([usEast1, euCentral1]) as any
    );
    const [, secondAction] = store.getActions();
    expect(isType(secondAction, actions.failed)).toBe(true);
    expect(secondAction.payload.error).toHaveLength(1);
    expect(secondAction.payload.error[0]).toHaveProperty('error', [
      { reason: 'An error occurred' },
    ]);
  });
});

describe('gatherDataAndErrors', () => {
  const bucket = objectStorageBucketFactory.build();
  const makeData = (): GetAllData<ObjectStorageBucket> => ({
    data: [bucket],
    results: 1,
  });
  const makeError = (): BucketError => ({
    error: { reason: 'An error occurred.' },
    clusterId: usEast1,
  });

  it('combines data', () => {
    const input = [makeData(), makeData()];
    const result = gatherDataAndErrors(input);
    expect(result).toHaveProperty('data', [bucket, bucket]);
    expect(result.errors).toHaveLength(0);
  });
  it('handles errors', () => {
    const input = [makeData(), makeError()];
    const result = gatherDataAndErrors(input);
    expect(result).toHaveProperty('data', [bucket]);
    expect(result).toHaveProperty('errors', [input[1]]);
  });
});
