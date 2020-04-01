import { ObjectStorageBucket } from 'linode-js-sdk/lib/object-storage';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State as BucketState } from 'src/store/bucket/bucket.reducer';
import { getAllBucketsInAllClusters } from 'src/store/bucket/bucket.requests';
import { requestClusters as _requestClusters } from 'src/store/clusters/clusters.actions';
import { State as ClusterState } from 'src/store/clusters/clusters.reducer';
import { Dispatch } from './types';

export interface ObjectStorageProps {
  buckets: BucketState;
  objectStorageClusters: ClusterState;
  requestBucketsForCluster: () => Promise<ObjectStorageBucket[]>;
}

export const useObjectStorage = () => {
  const dispatch: Dispatch = useDispatch();

  const buckets = useSelector(
    (state: ApplicationState) => state.__resources.buckets
  );

  const objectStorageClusters = useSelector(
    (state: ApplicationState) => state.__resources.clusters
  );

  const requestClusters = () => dispatch(_requestClusters());

  const requestAllBucketsInAllClusters = () =>
    dispatch(getAllBucketsInAllClusters());

  return {
    buckets,
    objectStorageClusters,
    requestAllBucketsInAllClusters,
    requestClusters
  };
};

export default useObjectStorage;
