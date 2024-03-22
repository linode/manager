import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { ServiceTypes } from './types';

/**
 * getCloudViewServiceTypes
 *
 * Returns list of CloudView Service Types with details.
 *
 */
export const getCloudViewServiceTypes = () =>
  Request<ServiceTypes>(
    setURL(`${API_ROOT}/cloudview/services`),
    setMethod('GET')
  );
