import { getKubernetesCluster, getKubernetesClusters } from 'src/services/kubernetes';
import { getAll } from 'src/utilities/getAll';
import { ThunkActionCreator } from '../types';
import { requestClustersActions, upsertCluster } from './kubernetes.actions';

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
  getKubernetesCluster(clusterID)
    .then(cluster => {
      return dispatch(upsertCluster(cluster));
    });
};
