import { connect } from 'react-redux';
import {} from 'src/store/bucket/bucket.actions';
import {
  createBucket,
  CreateBucketRequest
} from 'src/store/bucket/bucket.requests';

export interface BucketsRequests {
  createBucket: (request: CreateBucketRequest) => Promise<Linode.Bucket>;
}

export default connect(
  undefined,
  {
    createBucket
  }
);
