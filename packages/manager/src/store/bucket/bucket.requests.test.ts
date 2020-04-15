import { ObjectStorageBucket } from 'linode-js-sdk/lib/object-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { GetAllData } from 'src/utilities/getAll';
import { isType } from 'typescript-fsa';
import { getAllBucketsForAllClustersActions as actions } from './bucket.actions';
import {
  gatherDataAndErrors,
  getAllBucketsFromAllClusters
} from './bucket.requests';
import { BucketError } from './types';

const mockStore = configureMockStore([thunk]);

// Mock the cluster display map so the number of calls to getBucketsInCluster is deterministic.
// We need this to stay the same even as we add new clusters, so that the mocked values work out.
jest.mock('src/constants', () => ({
  objectStorageClusterDisplay: {
    'us-east-1': 'Newark, NJ',
    'eu-central-1': 'Frankfurt, DE'
  }
}));

jest.mock('linode-js-sdk/lib/object-storage', () => {
  const buckets1 = objectStorageBucketFactory.buildList(1, {
    cluster: 'us-east-1'
  });
  const buckets2 = objectStorageBucketFactory.buildList(1, {
    cluster: 'eu-central-1'
  });
  return {
    getBucketsInCluster: jest
      .fn()
      // First test
      .mockResolvedValueOnce({ data: buckets1, results: 1 })
      .mockResolvedValueOnce({ data: buckets2, results: 1 })
      // Second test
      .mockResolvedValueOnce({ data: buckets1, results: 1 })
      .mockRejectedValueOnce([{ reason: 'An error occurred' }])
  };
});

describe('getAllBucketsFromAllClusters', () => {
  it('handles successes', async () => {
    const store = mockStore();
    await store.dispatch(getAllBucketsFromAllClusters() as any);
    const [firstAction, secondAction] = store.getActions();
    expect(isType(firstAction, actions.started)).toBe(true);
    expect(isType(secondAction, actions.done)).toBe(true);
    expect(secondAction.payload.result).toHaveLength(2);
  });
  it('handles errors', async () => {
    const store = mockStore();
    await store.dispatch(getAllBucketsFromAllClusters() as any);
    const [, secondAction] = store.getActions();
    expect(isType(secondAction, actions.failed)).toBe(true);
    expect(secondAction.payload.error).toHaveLength(1);
    expect(secondAction.payload.error[0]).toHaveProperty('error', [
      { reason: 'An error occurred' }
    ]);
  });
});

describe('gatherDataAndErrors', () => {
  const bucket = objectStorageBucketFactory.build();
  const makeData = (): GetAllData<ObjectStorageBucket> => ({
    data: [bucket],
    results: 1
  });
  const makeError = (): BucketError => ({
    error: { reason: 'An error occurred.' },
    clusterId: 'us-east-1'
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
