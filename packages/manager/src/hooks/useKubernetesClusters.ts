import { KubernetesCluster } from 'linode-js-sdk/lib/kubernetes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/kubernetes/kubernetes.reducer';
import { requestKubernetesClusters as _request } from 'src/store/kubernetes/kubernetes.requests';
import { Dispatch } from './types';

export interface DomainsProps {
  kubernetesClusters: State;
  requestKubernetesClusters: () => Promise<KubernetesCluster[]>;
}

export const useDomains = () => {
  const dispatch: Dispatch = useDispatch();
  const kubernetesClusters = useSelector(
    (state: ApplicationState) => state.__resources.kubernetes
  );
  const requestKubernetesClusters = () => dispatch(_request());

  return { kubernetesClusters, requestKubernetesClusters };
};

export default useDomains;
