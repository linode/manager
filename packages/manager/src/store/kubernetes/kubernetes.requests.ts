import {
  createNodePool as _createNodePool,
  deleteKubernetesCluster as _deleteCluster,
  deleteNodePool as _deleteNodePool,
  getKubernetesCluster,
  getKubernetesClusters,
  KubernetesCluster,
  updateKubernetesCluster as _updateCluster,
  updateNodePool as _updateNodePool
} from 'linode-js-sdk/lib/kubernetes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  updateClusterActions
} from './kubernetes.actions';
import { requestNodePoolsForCluster } from './nodePools.requests';

const getAllClusters = getAll<KubernetesCluster>(getKubernetesClusters);

export const requestKubernetesClusters: ThunkActionCreator<
  Promise<KubernetesCluster[]>
> = () => dispatch => {
  dispatch(requestClustersActions.started());

  return getAllClusters()
    .then(({ data }) => {
      let i = 0;
      for (; i < data.length; i++) {
        dispatch(requestNodePoolsForCluster({ clusterID: data[i].id }));
      }
      return dispatch(
        requestClustersActions.done({
          result: data
        })
      );
    })
    .catch(error => {
      dispatch(requestClustersActions.failed({ error }));
      return error;
    });
};

type RequestClusterForStoreThunk = ThunkActionCreator<void, number>;
export const requestClusterForStore: RequestClusterForStoreThunk = clusterID => dispatch => {
  dispatch(requestClusterActions.started({ clusterID }));
  getKubernetesCluster(clusterID)
    .then(cluster => {
      dispatch(requestNodePoolsForCluster({ clusterID }));
      return dispatch(
        requestClusterActions.done({ result: cluster, params: { clusterID } })
      );
    })
    .catch(err => {
      dispatch(
        requestClusterActions.failed({ error: err, params: { clusterID } })
      );
    });
};

export const updateCluster = createRequestThunk(
  updateClusterActions,
  ({ clusterID, ...data }) => _updateCluster(clusterID, data)
);

export const deleteCluster = createRequestThunk(
  deleteClusterActions,
  ({ clusterID }) => _deleteCluster(clusterID)
);
