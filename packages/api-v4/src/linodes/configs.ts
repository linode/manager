import {
  CreateLinodeConfigSchema,
  UpdateConfigInterfaceOrderSchema,
  UpdateConfigInterfaceSchema,
  UpdateLinodeConfigSchema,
  ConfigProfileInterfaceSchema,
} from '@linode/validation/lib/linodes.schema';
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
  Config,
  ConfigInterfaceOrderPayload,
  Interface,
  InterfacePayload,
  LinodeConfigCreationData,
  UpdateConfigInterfacePayload,
} from './types';

/**
 * getLinodeConfigs
 *
 * Lists Configuration profiles associated with the specified Linode.
 *
 * @param linodeId { number } The id of the Linode to list configs for.
 * @todo VolumeAttachmentDrawer, ConfigSelect, and LinodeConfigs all make use of this still, and probably shouldnt.
 */
export const getLinodeConfigs = (
  linodeId: number,
  params?: Params,
  filters?: Filter
) =>
  Request<Page<Config>>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getLinodeConfig
 *
 * Returns information about a single Linode configuration.
 *
 * @param linodeId { number } The id of a Linode the specified config is attached to.
 * @param configId { number } The id of the config to be returned
 */
export const getLinodeConfig = (linodeId: number, configId: number) =>
  Request<Config>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
    setMethod('GET')
  );

/**
 * createLinodeConfig
 *
 * Adds a new Configuration profile to a Linode.
 *
 * @param linodeId { number } The id of a Linode to receive the new config.
 */
export const createLinodeConfig = (
  linodeId: number,
  data: LinodeConfigCreationData
) =>
  Request<Config>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/configs`
    ),
    setMethod('POST'),
    setData(data, CreateLinodeConfigSchema)
  );

/**
 * deleteLinodeConfig
 *
 * Delete a single configuration profile from a Linode.
 *
 * @param linodeId { number } The id of a Linode the specified config is attached to.
 * @param configId { number } The id of the config to be deleted
 */
export const deleteLinodeConfig = (linodeId: number, configId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(configId)}`
    )
  );

/**
 * updateLinodeConfig
 *
 * Update a configuration profile.
 * Interfaces field must be omitted or null if Linode is using new Linode Interfaces.
 *
 * @param linodeId { number } The id of a Linode the specified config is attached to.
 * @param configId { number } The id of the config to be updated.
 */
export const updateLinodeConfig = (
  linodeId: number,
  configId: number,
  data: Partial<LinodeConfigCreationData>
) =>
  Request<Config>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(configId)}`
    ),
    setMethod('PUT'),
    setData(data, UpdateLinodeConfigSchema)
  );

/**
 * getConfigInterfaces
 *
 * Return non-paginated list in devnum order of all interfaces on the given config.
 *
 * @param linodeId { number } The id of a Linode.
 * @param configId { number } The id of a config belonging to the specified Linode.
 */
export const getConfigInterfaces = (linodeId: number, configId: number) =>
  Request<Interface[]>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(configId)}/interfaces`
    ),
    setMethod('GET')
  );

/**
 * getConfigInterface
 *
 * Get a single Linode config interface object using the interface's unique ID.
 *
 * @param linodeId { number } The id of a Linode.
 * @param configId { number } The id of a config belonging to the specified Linode.
 * @param interfaceId { number } The id of an interface belonging to the specified config.
 */
export const getConfigInterface = (
  linodeId: number,
  configId: number,
  interfaceId: number
) =>
  Request<Interface>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(
        configId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    ),
    setMethod('GET')
  );

/**
 * appendConfigInterface
 *
 * Append a single new Linode config interface object to an existing config.
 * Cannot be used for Linodes using the new Linode Interfaces.
 *
 * @param linodeId { number } The id of a Linode to receive the new config interface.
 * @param configId { number } The id of a config to receive the new interface.
 */
export const appendConfigInterface = (
  linodeId: number,
  configId: number,
  data: InterfacePayload
) =>
  Request<Interface>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(configId)}/interfaces`
    ),
    setMethod('POST'),
    setData(data, ConfigProfileInterfaceSchema)
  );

/**
 * updateConfigInterface
 *
 * Change an existing interface.
 *
 * @param linodeId { number } The id of a Linode.
 * @param configId { number } The id of a config belonging to that Linode.
 * @param interfaceId { number } The id of an interface belonging to the specified config.
 */
export const updateConfigInterface = (
  linodeId: number,
  configId: number,
  interfaceId: number,
  data: UpdateConfigInterfacePayload
) =>
  Request<Interface>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(
        configId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    ),
    setMethod('PUT'),
    setData(data, UpdateConfigInterfaceSchema)
  );

/**
 * updateLinodeConfigOrder
 *
 * Change the order of interfaces.
 *
 * @param linodeId { number } The id of a Linode.
 * @param configId { number } The id of a config belonging to the specified Linode.
 */
export const updateLinodeConfigOrder = (
  linodeId: number,
  configId: number,
  data: ConfigInterfaceOrderPayload
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(configId)}/interfaces/order`
    ),
    setMethod('POST'),
    setData(data, UpdateConfigInterfaceOrderSchema)
  );

/**
 * deleteLinodeConfigInterface
 *
 * Delete a Linode config interface.
 *
 * @param linodeId { number } The id of a Linode the specified config is attached to.
 * @param configId { number } The id of a config belonging to the specified Linode.
 * @param interfaceId { number } The id of the interface to be deleted.
 */
export const deleteLinodeConfigInterface = (
  linodeId: number,
  configId: number,
  interfaceId: number
) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId
      )}/configs/${encodeURIComponent(
        configId
      )}/interfaces/${encodeURIComponent(interfaceId)}`
    )
  );
