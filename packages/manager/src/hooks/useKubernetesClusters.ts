import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/kubernetes/kubernetes.reducer';
import {
  requestKubernetesClusters as _request,
  updateCluster as _update,
} from 'src/store/kubernetes/kubernetes.requests';
import { Dispatch } from './types';

export interface KubernetesProps {
  kubernetesClusters: State;
  requestKubernetesClusters: () => Promise<KubernetesCluster[]>;
  updateKubernetesCluster: (
    clusterID: number,
    updatedCluster: Partial<KubernetesCluster>
  ) => Promise<KubernetesCluster>;
}

export const useKubernetesClusters = (): KubernetesProps => {
  const dispatch: Dispatch = useDispatch();
  const kubernetesClusters = useSelector(
    (state: ApplicationState) => state.__resources.kubernetes
  );
  const requestKubernetesClusters = () =>
    dispatch(_request()).then(response => response.data);

  const updateKubernetesCluster = (
    clusterID: number,
    updatedCluster: Partial<KubernetesCluster>
  ) => dispatch(_update({ clusterID, ...updatedCluster }));

  return {
    kubernetesClusters,
    requestKubernetesClusters,
    updateKubernetesCluster,
  };
};

export default useKubernetesClusters;
