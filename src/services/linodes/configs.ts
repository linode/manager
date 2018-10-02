import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

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

export const getLinodeConfigs = (id: number) =>
  Request<Page<Config>>(
    setURL(`${API_ROOT}/linode/instances/${id}/configs`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getLinodeConfig = (linodeId: number, configId: number) =>
  Request<Config>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const createLinodeConfig = (linodeId: number, data: LinodeConfigCreationData) =>
  Request<Config>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs`),
    setMethod('POST'),
    setData(data),
  );

export const deleteLinodeConfig = (linodeId: number, configId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
  );

export const updateLinodeConfig = (
  linodeId: number,
  configId: number,
  data: LinodeConfigCreationData,
) => Request<Config>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
  setMethod('PUT'),
  setData(data),
  );
