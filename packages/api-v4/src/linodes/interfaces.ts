import type { Firewall } from 'src/firewalls/types';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateLinodeInterfacePayload,
  LinodeInterfaceHistory,
  LinodeInterfaceSetting,
  LinodeInterfaceSettingPayload,
  LinodeInterface,
  LinodeInterfaces,
  ModifyLinodeInterfacePayload,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
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
  Request<LinodeInterface>(
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
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/interfaces`
    ),
    setMethod('GET')
  );

/**
 * getLinodeInterfacesHistory
 *
 * Returns paginated list of interface history for specified Linode.
 *
 * @param linodeId { number } The id of a Linode to get the interface history for.
 */
export const getLinodeInterfacesHistory = (
  linodeId: number,
  params?: Params,
  filters?: Filter
) =>
  Request<Page<LinodeInterfaceHistory>>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/history`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getLinodeInterfacesSettings
 *
 * Returns the interface settings related to the specified Linode.
 *
 * @param linodeId { number } The id of a Linode to get the interface history for.
 */
export const getLinodeInterfacesSettings = (linodeId: number) =>
  Request<LinodeInterfaceSetting>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/settings`
    ),
    setMethod('GET')
  );

/**
 * updateLinodeInterfacesSettings
 *
 * Update the interface settings related to the specified Linode.
 *
 * @param linodeId { number } The id of a Linode to update the interface settings for.
 * @param data { LinodeInterfaceSettingPayload } The payload to update the interface settings with.
 */
export const updateLinodeInterfacesSettings = (
  linodeId: number,
  data: LinodeInterfaceSettingPayload
) =>
  Request<LinodeInterfaceSetting>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/settings`
    ),
    setMethod('PUT'),
    setData(data) // TODO CONNIE ANOTHER SCHEMA HERE
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
  Request<LinodeInterface>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    ),
    setMethod('GET')
  );

/**
 * updateLinodeInterface
 *
 * Update specified interface for the specified Linode.
 *
 * @param linodeId { number } The id of a Linode to update the interface history for.
 * @param interfaceId { number } The id of the Interface to update.
 * @param data { ModifyLinodeInterfacePayload } The payload to update the interface with.
 */
export const updateLinodeInterface = (
  linodeId: number,
  interfaceId: number,
  data: ModifyLinodeInterfacePayload
) =>
  Request<LinodeInterfaceSetting>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    ),
    setMethod('PUT'),
    setData(data) // TODO CONNIE ANOTHER SCHEMA HERE
  );

/**
 * deleteLinodeInterface
 *
 * Delete a single specified Linode interface.
 *
 * @param linodeId { number } The id of a Linode to update the interface history for.
 * @param interfaceId { number } The id of the Interface to update.
 */
export const deleteLinodeInterface = (linodeId: number, interfaceId: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    ),
    setMethod('DELETE')
  );

/**
 * getLinodeInterfaceFirewalls
 *
 * Returns information about the firewalls for the specified Linode interface.
 *
 * @param linodeId { number } The id of a Linode the specified Linode Interface is attached to.
 * @param interfaceId { number } The id of the Linode Interface to get the firewalls for
 */
export const getLinodeInterfaceFirewalls = (
  linodeId: number,
  interfaceId: number
) =>
  Request<Firewall>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/interfaces/${encodeURIComponent(interfaceId)}/firewalls`
    ),
    setMethod('GET')
  );

/**
 * upgradeToLinodeInterface
 *
 * Upgrades legacy configuration interfaces to new Linode Interfaces.
 * This is a POST endpoint.
 *
 * @param linodeId { number } The id of a Linode to receive the new interface.
 */
export const upgradeToLinodeInterface = (
  linodeId: number,
  data: UpgradeInterfacePayload
) =>
  Request<UpgradeInterfaceData>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/interfaces`
    ),
    setMethod('POST'),
    setData(data) // TODO CONNIE PUT A VALIDATION SCHEMA HERE
  );
