import { Params, PriceType, ResourcePage } from 'src/types';
import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL } from '../request';

/**
 * getObjectStorageTypes
 *
 * Return a paginated list of available Object Storage types; used for pricing.
 * This endpoint does not require authentication.
 */
export const getObjectStorageTypes = (params?: Params) =>
  Request<ResourcePage<PriceType>>(
    setURL(`${API_ROOT}/object-storage/types`),
    setMethod('GET'),
    setParams(params)
  );
