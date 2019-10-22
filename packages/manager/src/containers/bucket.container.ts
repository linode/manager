import { Bucket } from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { connect, MapStateToProps } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface StateProps {
  bucketsData: Bucket[];
  bucketsLoading: boolean;
  bucketsError?: Error | APIError[];
}

const mapStateToProps: MapStateToProps<
  StateProps,
  {},
  ApplicationState
> = state => ({
  bucketsData: state.__resources.buckets.data,
  bucketsLoading: state.__resources.buckets.loading,
  bucketsError: state.__resources.buckets.error
});

export default connect(mapStateToProps);
