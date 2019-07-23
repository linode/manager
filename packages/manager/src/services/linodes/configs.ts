import { API_ROOT } from 'src/constants';

import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

import {
  CreateLinodeConfigSchema,
  UpdateLinodeConfigSchema
} from './linode.schema';

type Page<T> = Linode.ResourcePage<T>;
type Config = Linode.Config;

export interface LinodeConfigCreationData {
  label: string;
  devices: Linode.Devices;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: 'default' | 'single' | 'binbash';
  virt_mode?: 'fullvirt' | 'paravirt';
  helpers: {
    updatedb_disabled: boolean;
    distro: boolean;
    modules_dep: boolean;
    network: boolean;
    devtmpfs_automount: boolean;
  };
  root_device: string;
}

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
  params?: any,
  filters?: any
) =>
  Request<Page<Config>>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  ).then(response => response.data);

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
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs`),
    setMethod('POST'),
    setData(data, CreateLinodeConfigSchema)
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`)
  ).then(response => response.data);

/**
 * updateLinodeConfig
 *
 * Update a configuration profile.
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
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
    setMethod('PUT'),
    setData(data, UpdateLinodeConfigSchema)
  ).then(response => response.data);
