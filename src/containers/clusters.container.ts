import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface StateProps {
  clustersData: Linode.Cluster[];
  clustersError?: Linode.ApiFieldError[];
  clustersLoading: boolean;
}

export default connect((state: ApplicationState) => ({
  clustersData: state.__resources.clusters.entities,
  clustersLoading: state.__resources.clusters.loading,
  clustersError: state.__resources.clusters.error
}));
