import { ObjectStorageCluster } from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface StateProps {
  clustersData: ObjectStorageCluster[];
  clustersError?: APIError[];
  clustersLoading: boolean;
}

export default connect((state: ApplicationState) => ({
  clustersData: state.__resources.clusters.entities,
  clustersLoading: state.__resources.clusters.loading,
  clustersError: state.__resources.clusters.error
}));
