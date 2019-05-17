import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

type Page<T> = Linode.ResourcePage<T>;

/**
 * getClusters
 *
 * Gets a list of available clusters
 */
export const getClusters = (params?: any, filters?: any) =>
  Request<Page<Linode.Cluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}beta/object-storage/clusters`)
  ).then(response => response.data);
