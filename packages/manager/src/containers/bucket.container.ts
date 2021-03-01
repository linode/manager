import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { connect, MapStateToProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { BucketError } from 'src/store/bucket/types';

export interface StateProps {
  bucketsData: ObjectStorageBucket[];
  bucketsLoading: boolean;
  bucketErrors?: BucketError[];
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (
  state
) => ({
  bucketsData: state.__resources.buckets.data,
  bucketsLoading: state.__resources.buckets.loading,
  bucketErrors: state.__resources.buckets.bucketErrors,
});

export default connect(mapStateToProps);
