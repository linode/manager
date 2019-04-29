import { API_ROOT } from 'src/constants';
import Request, {
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

type Page<T> = Linode.ResourcePage<T>;

/**
 * getKubernetesClusters
 *
 * Gets a list of a user's Kubernetes clusters
 */
export const getKubernetesClusters = (params?: any, filters?: any) =>
  Request<Page<Linode.KubernetesCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/lke/clusters`)
  ).then(response => response.data);

