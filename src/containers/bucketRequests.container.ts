import { connect } from 'react-redux';
import {} from 'src/store/bucket/bucket.actions';
import {
  createBucket,
  CreateBucketRequest,
  deleteBucket,
  DeleteBucketRequest
} from 'src/store/bucket/bucket.requests';

export interface BucketsRequests {
  createBucket: (request: CreateBucketRequest) => Promise<Linode.Bucket>;
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
