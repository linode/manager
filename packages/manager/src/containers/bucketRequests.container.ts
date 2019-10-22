import { Bucket } from 'linode-js-sdk/lib/object-storage';
import { connect } from 'react-redux';
import {
  createBucket,
  CreateBucketRequest,
  deleteBucket,
  DeleteBucketRequest
} from 'src/store/bucket/bucket.requests';

export interface BucketsRequests {
  createBucket: (request: CreateBucketRequest) => Promise<Bucket>;
  deleteBucket: (request: DeleteBucketRequest) => Promise<{}>;
}

export default connect(
  // We don't use mapStateToProps here, so we make it undefined
  undefined,
  {
    createBucket,
    deleteBucket
  }
);
