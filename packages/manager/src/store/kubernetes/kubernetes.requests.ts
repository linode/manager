import {
  deleteKubernetesCluster as _deleteCluster,
  getKubernetesCluster,
  getKubernetesClusters,
  KubernetesCluster,
  updateKubernetesCluster as _updateCluster,
} from '@linode/api-v4/lib/kubernetes';
import { getAll, GetAllData } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  updateClusterActions,
} from './kubernetes.actions';
import { requestNodePoolsForCluster } from './nodePools.requests';

const getAllClusters = getAll<KubernetesCluster>(getKubernetesClusters);

export const requestKubernetesClusters: ThunkActionCreator<Promise<
  GetAllData<KubernetesCluster>
>> = () => (dispatch) => {
  dispatch(requestClustersActions.started());

  return getAllClusters()
    .then((response) => {
      let i = 0;
      for (; i < response.data.length; i++) {
        dispatch(
          requestNodePoolsForCluster({ clusterID: response.data[i].id })
        );
      }
      dispatch(
        requestClustersActions.done({
          result: response,
        })
      );
      return response;
    })
    .catch((error) => {
      dispatch(requestClustersActions.failed({ error }));
      return error;
    });
};

type RequestClusterForStoreThunk = ThunkActionCreator<
  Promise<KubernetesCluster>,
  number
>;
export const requestClusterForStore: RequestClusterForStoreThunk = (
  clusterID
) => (dispatch) => {
  dispatch(requestClusterActions.started({ clusterID }));
  return getKubernetesCluster(clusterID)
    .then((cluster) => {
      dispatch(requestNodePoolsForCluster({ clusterID }));
      dispatch(
        requestClusterActions.done({ result: cluster, params: { clusterID } })
      );
      return cluster;
    })
    .catch((err) => {
      dispatch(
        requestClusterActions.failed({ error: err, params: { clusterID } })
      );
      return Promise.reject(err);
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
