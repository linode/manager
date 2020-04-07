import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { isType } from 'typescript-fsa';
import { getAllBucketsForAllClustersActions as actions } from './bucket.actions';
import { getAllBucketsFromAllClusters } from './bucket.requests';

const mockStore = configureMockStore([thunk]);

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
