import {
  ObjectStorageBucket,
  ObjectStorageClusterID,
} from '@linode/api-v4/lib/object-storage/types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { REFRESH_INTERVAL } from 'src/constants';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/bucket/bucket.reducer';
import {
  deleteBucket,
  DeleteBucketRequest,
  getAllBucketsFromClusters,
} from 'src/store/bucket/bucket.requests';
import { Dispatch } from './types';
import useAccountManagement from './useAccountManagement';
import useReduxLoad from './useReduxLoad';

export interface ObjectStorageBucketProps {
  objectStorageBuckets: State;
  requestObjectStorageBuckets: () => Promise<ObjectStorageBucket[]>;
  deleteObjectStorageBucket: (request: DeleteBucketRequest) => Promise<{}>;
}

export const useObjectStorageBuckets = () => {
  const dispatch: Dispatch = useDispatch();
  const objectStorageBuckets = useSelector(
    (state: ApplicationState) => state.__resources.buckets
  );
  const requestObjectStorageBuckets = (clusterIds: ObjectStorageClusterID[]) =>
    dispatch(getAllBucketsFromClusters(clusterIds));
  const deleteObjectStorageBucket = (options: DeleteBucketRequest) =>
    dispatch(deleteBucket(options));

  return {
    objectStorageBuckets,
    requestObjectStorageBuckets,
    deleteObjectStorageBucket,
  };
};

export default useObjectStorageBuckets;

// Object Storage Redux integration is slightly complicated in that to request
// a user's Buckets, we must first request Clusters. This hook neatly abstracts
// that logic, so that `const { objectStorageBuckets } = useObjectStorage();`
// is all you need to appropriately get Bucket data into your component.
//
// The hook accepts a `predicate` argument, which, if false, prevents Cluster
// and Bucket data from being loaded.
//
// @todo: use this hook everywhere Cluster and/or Bucket data is needed.
export const useObjectStorage = (predicate?: boolean) => {
  const dispatch: Dispatch = useDispatch();

  const { _isRestrictedUser } = useAccountManagement();

  useReduxLoad(['clusters'], REFRESH_INTERVAL, predicate || _isRestrictedUser);

  const objectStorageClusters = useSelector(
    (state: ApplicationState) => state.__resources.clusters
  );
  const objectStorageBuckets = useSelector(
    (state: ApplicationState) => state.__resources.buckets
  );

  const clustersLoaded = objectStorageClusters.lastUpdated > 0;

  const bucketsLoadingOrLoaded =
    objectStorageBuckets.loading ||
    objectStorageBuckets.lastUpdated > 0 ||
    objectStorageBuckets.bucketErrors;

  useEffect(() => {
    // Object Storage is not available for restricted users.
    if (_isRestrictedUser || (typeof predicate === 'boolean' && !predicate)) {
      return;
    }

    // Once the OBJ Clusters have been loaded, request Buckets from each Cluster.
    if (clustersLoaded && !bucketsLoadingOrLoaded) {
      const clusterIds = objectStorageClusters.entities.map(
        thisCluster => thisCluster.id
      );

      dispatch(getAllBucketsFromClusters(clusterIds)).catch(_ => null);
    }
  }, [
    _isRestrictedUser,
    clustersLoaded,
    bucketsLoadingOrLoaded,
    objectStorageClusters,
    dispatch,
    predicate,
  ]);

  return {
    objectStorageBuckets,
    objectStorageClusters,
    loading: objectStorageClusters.loading || objectStorageBuckets.loading,
  };
};
