import {
  ObjectStorageBucket,
  ObjectStorageClusterID
} from '@linode/api-v4/lib/object-storage/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/bucket/bucket.reducer';
import {
  getAllBucketsFromAllClusters,
  DeleteBucketRequest,
  deleteBucket
} from 'src/store/bucket/bucket.requests';
import { Dispatch } from './types';

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
    dispatch(getAllBucketsFromAllClusters(clusterIds));
  const deleteObjectStorageBucket = (options: DeleteBucketRequest) =>
    dispatch(deleteBucket(options));

  return {
    objectStorageBuckets,
    requestObjectStorageBuckets,
    deleteObjectStorageBucket
  };
};

export default useObjectStorageBuckets;
