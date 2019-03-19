import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface Props {
  bucketsData: Linode.Bucket[];
  bucketsLoading: boolean;
  bucketsError?: Error;
}

export default connect((state: ApplicationState) => {
  return {
    bucketsData: state.__resources.buckets.data,
    bucketsLoading: state.__resources.buckets.loading,
    bucketsError: state.__resources.buckets.error
  };
});
