import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, ResourcePage as Page, Params } from '../types';
import {
  CreateLinodeInterfacePayload,
  InterfaceHistory,
  LinodeInterfaceData,
  LinodeInterfaces,
} from './types';

/**
 * createLinodeInterface
 *
 * Adds a new Linode Interface to a Linode.
 * This endpoint is part of the new Linode Interfaces endpoints being introduced.
 *
 * @param linodeId { number } The id of a Linode to receive the new interface.
 */
export const createLinodeInterface = (
  linodeId: number,
  data: CreateLinodeInterfacePayload
) =>
  Request<LinodeInterfaceData>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/interfaces`
    ),
    setMethod('POST'),
    setData(data) // TODO CONNIE PUT A VALIDATION SCHEMA HERE
  );

/**
 * getLinodeInterfaces
 *
 * Gets LinodeInterfaces associated with the specified Linode.
 *
 * @param linodeId { number } The id of the Linode to get all Linode Interfaces for.
 */
export const getLinodeInterfaces = (linodeId: number) =>
  Request<LinodeInterfaces>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/interfaces`),
    setMethod('GET')
  );

/**
 * getLinodeInterface
 *
 * Returns information about a single Linode interface.
 *
 * @param linodeId { number } The id of a Linode the specified Linode Interface is attached to.
 * @param interfaceId { number } The id of the Linode Interface to be returned
 */
export const getLinodeInterface = (linodeId: number, interfaceId: number) =>
  Request<LinodeInterfaceData>(
    setURL(
      `${API_ROOT}/linode/instances/${linodeId}/interfaces/${interfaceId}`
    ),
    setMethod('GET')
  );

/**
 * getLinodeInterfacesHistory
 *
 * Returns paginated list of interface history for specified Linode
 *
 * @param linodeId { number } The id of a Linode to get the interface history for.
 */
export const getLinodeInterfacesHistory = (
  linodeId: number,
  params?: Params,
  filters?: Filter
) =>
  Request<Page<InterfaceHistory>>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/interfaces/history`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );
