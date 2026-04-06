import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { ObjectStorageCluster } from './types';

/**
 * @deprecated This method returns legacy clusterId values representing regions
 * used in older API versions. It is maintained for backward compatibility only.
 * Please use the "getRegions" endpoint instead for up-to-date information.
 */
export const getClusters = (params?: Params, filters?: Filter) =>
  Request<Page<ObjectStorageCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/object-storage/clusters`),
  );
