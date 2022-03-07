import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { connect } from 'react-redux';
import {
  createBucket,
  CreateBucketRequest,
  deleteBucket,
  getBucket,
  DeleteBucketRequest,
  GetBucketRequest,
} from 'src/store/bucket/bucket.requests';

export interface BucketsRequests {
  createBucket: (request: CreateBucketRequest) => Promise<ObjectStorageBucket>;
  deleteBucket: (request: DeleteBucketRequest) => Promise<{}>;
  getBucket: (request: GetBucketRequest) => Promise<ObjectStorageBucket>;
}

export default connect(
  // We don't use mapStateToProps here, so we make it undefined
  undefined,
  {
    createBucket,
    deleteBucket,
    getBucket,
  }
);
