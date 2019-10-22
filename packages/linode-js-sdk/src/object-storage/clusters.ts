import { BETA_API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage as Page } from '../types';
import { Cluster } from './types';

/**
 * getClusters
 *
 * Gets a list of available clusters
 */
export const getClusters = (params?: any, filters?: any) =>
  Request<Page<Cluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/object-storage/clusters`)
  ).then(response => response.data);
