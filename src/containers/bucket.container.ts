import {
  connect,
  Dispatch,
  MapDispatchToProps,
  MapStateToProps
} from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  closeBucketDrawer,
  openBucketDrawer
} from 'src/store/bucketDrawer/bucketDrawer.actions';

export interface StateProps {
  bucketsData: Linode.Bucket[];
  bucketsLoading: boolean;
  bucketsError?: Error | Linode.ApiFieldError[];
}

export interface DispatchProps {
  openBucketDrawer: () => void;
  closeBucketDrawer: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: Dispatch<any>
) => ({
  openBucketDrawer: () => dispatch(openBucketDrawer()),
  closeBucketDrawer: () => dispatch(closeBucketDrawer())
});

const mapStateToProps: MapStateToProps<
  StateProps,
  {},
  ApplicationState
> = state => ({
  bucketsData: state.__resources.buckets.data,
  bucketsLoading: state.__resources.buckets.loading,
  bucketsError: state.__resources.buckets.error
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
