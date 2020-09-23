// @todo use beta api root once API bug is fixed
import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';

import { LinodeInterface, LinodeInterfacePayload } from './types';

/**
 * getInterfaces
 *
 * Return a list of network interfaces attached to the current
 * Linode
 *
 */
export const getInterfaces = (linodeID: number, params?: any, filters?: any) =>
  Request<Page<LinodeInterface>>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/interfaces`),
    setMethod('GET'),
    setXFilter(filters),
    setParams(params)
  );

/**
 * getInterface
 *
 * Return details about a single Linode interface
 *
 */
export const getInterface = (linodeID: number, interfaceID: number) =>
  Request<LinodeInterface>(
    setURL(
      `${API_ROOT}/linode/instances/${linodeID}/interfaces/${interfaceID}`
    ),
    setMethod('GET')
  );

/**
 * createInterface
 *
 * Attach a new interface to a Linode. Two types of interface are
 * supported, default (which creates a public interface)
 * and additional. When creating an additional interface, a vlan_id
 * is required.
 *
 */
export const createInterface = (
  linodeID: number,
  data: LinodeInterfacePayload
) =>
  Request<LinodeInterface>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/interfaces`),
    setMethod('POST'),
    setData(data)
  );

/**
 * deleteInterface
 *
 * Return details about a single Linode interface
 *
 */
export const deleteInterface = (linodeID: number, interfaceID: number) =>
  Request<LinodeInterface>(
    setURL(
      `${API_ROOT}/linode/instances/${linodeID}/interfaces/${interfaceID}`
    ),
    setMethod('DELETE')
  );
