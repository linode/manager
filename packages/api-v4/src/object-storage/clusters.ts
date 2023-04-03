import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import { ObjectStorageCluster } from './types';

/**
 * getClusters
 *
 * Gets a list of available clusters
 */
export const getClusters = (params?: Params, filters?: Filter) =>
  Request<Page<ObjectStorageCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/object-storage/clusters`)
  );
