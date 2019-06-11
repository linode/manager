import {
  createNodePool as _createNodePool,
  getKubernetesCluster,
  getKubernetesClusters,
  updateKubernetesCluster as _updateCluster,
  updateNodePool as _updateNodePool
} from 'src/services/kubernetes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createNodePoolActions,
  requestClustersActions,
  updateClusterActions,
  updateNodePoolActions,
  upsertCluster
} from './kubernetes.actions';

const getAllClusters = getAll<Linode.KubernetesCluster>(getKubernetesClusters);

export const requestKubernetesClusters: ThunkActionCreator<
  Promise<Linode.Cluster[]>
> = () => dispatch => {
  dispatch(requestClustersActions.started());

  return getAllClusters()
    .then(({ data }) => {
      dispatch(
        requestClustersActions.done({
          result: data
        })
      );
      return data;
    })
    .catch(error => {
      dispatch(requestClustersActions.failed({ error }));
      return error;
    });
};

type RequestClusterForStoreThunk = ThunkActionCreator<void>;
export const requestClusterForStore: RequestClusterForStoreThunk = clusterID => dispatch => {
  getKubernetesCluster(clusterID).then(cluster => {
    return dispatch(upsertCluster(cluster));
  });
};

export const updateCluster = createRequestThunk(
  updateClusterActions,
  ({ clusterID, ...data }) => _updateCluster(clusterID, data)
);

export const createNodePool = createRequestThunk(
  createNodePoolActions,
  ({ clusterID, ...data }) =>
    _createNodePool(clusterID, data).then(response => response.data)
);

export const updateNodePool = createRequestThunk(
  updateNodePoolActions,
  ({ clusterID, nodePoolID, ...data }) =>
    _updateNodePool(clusterID, nodePoolID, data).then(response => response.data)
);
