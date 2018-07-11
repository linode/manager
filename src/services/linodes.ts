import * as Joi from 'joi';
import { omit } from 'ramda';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter, validateRequestData } from '.';

type Page<T> = Linode.ResourcePage<T>;
type Linode = Linode.Linode;
type Config = Linode.Config;
type Type = Linode.LinodeType;
type Disk = Linode.Disk;

/* tslint:disable-next-line */
export type RescueRequestObject = Pick<Linode.Devices, 'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'>
export const rescueLinode = (linodeId: number, devices: RescueRequestObject): Promise<{}> =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/rescue`),
    setMethod('POST'),
    setData({ devices: omit(['sdh'], devices) }),
  );

export const getLinodeConfigs = (id: number) =>
  Request<Page<Config>>(
    setURL(`${API_ROOT}/linode/instances/${id}/configs`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getLinode = (id: number) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('GET'),
  );

export const linodeBoot = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/boot`),
    setMethod('POST'),
  );

export const linodeReboot = (id: number | string, data: any) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/reboot`),
    setMethod('POST'),
    setData(data),
  );

export const linodeShutdown = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/shutdown`),
    setMethod('POST'),
  );

export const getLinodeLishToken = (id: number) =>
  Request<{ lish_token: string }>(
    setURL(`${API_ROOT}/linode/instances/${id}/lish_token`),
    setMethod('POST'),
  );

export const getLinodeVolumes = (id: number) =>
  Request<Page<Linode.Volume>>(
    setURL(`${API_ROOT}/linode/instances/${id}/volumes`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getLinodeDisks = (id: number) =>
  Request<Page<Linode.Disk>>(
    setURL(`${API_ROOT}/linode/instances/${id}/disks`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getLinodeBackups = (id: number) =>
  Request<Linode.LinodeBackupsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/backups`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const enableBackups = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/backups/enable`),
    setMethod('POST'),
  );

export const cancelBackups = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/backups/cancel`),
    setMethod('POST'),
  );

export const takeSnapshot = (id: number, label: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/backups`),
    setMethod('POST'),
    setData({ label }),
  );

export const updateBackupsWindow = (id: number, day: string, window: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('PUT'),
    setData({ backups: { schedule: { day, window } } }),
  );

export const getLinodeIPs = (id: number) =>
  Request<Linode.LinodeIPsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/ips`),
    setMethod('GET'),
  )
    .then(response => response.data);

/** @todo type. */
export const allocatePrivateIP = (linodeID: number) =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData({ type: 'ipv4', public: false }),
  ).then(response => response.data);

/** @todo type */
export const allocatePublicIP = (linodeID: number) =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData({ type: 'ipv4', public: true }),
  ).then(response => response.data);

export const rebuildLinode = (id: number, image: string, password: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/rebuild`),
    setMethod('POST'),
    setData({ image, root_pass: password }),
  ).then(response => response.data);

export const resizeLinode = (id: number, type: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/resize`),
    setMethod('POST'),
    setData({ type }),
  );

export const getLinodes = (params: any = {}, filter: any = {}) =>
  Request<Page<Linode>>(
    setURL(`${API_ROOT}/linode/instances/`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  )
    .then(response => response.data);

export const getLinodesPage = (page: number) =>
  Request<Page<Linode>>(
    setURL(`${API_ROOT}/linode/instances/`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

/**@todo isnt this a Partial<Linode>? */
export const createLinode = (data: any) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const getLinodeKernels = (page: number = 0) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getType = (typeId: string) =>
  Request<Type>(
    setURL(`${API_ROOT}/linode/types/${typeId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const renameLinode = (linodeId: number, label: string) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('PUT'),
    setData({ label }),
  )
    .then(response => response.data);

/** @todo type */
export const getLinodeStats = (linodeId: number, year?: string, month?: string) => {
  const endpoint = (year && month)
    ? `${API_ROOT}/linode/instances/${linodeId}/stats/${year}/${month}`
    : `${API_ROOT}/linode/instances/${linodeId}/stats`;
  return Request(
    setURL(endpoint),
    setMethod('GET'),
  );
};

export const updateLinode = (id: number, values: any) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('PUT'),
    setData(values),
  );

export const changeLinodeDiskPassword = (
  linodeId: number,
  diskId: number,
  password: string,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/password`),
  setMethod('POST'),
  setData({ password }),
)
  .then(response => response.data);

export const deleteLinode = (linodeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('DELETE'),
  );

/**@todo type */
export const restoreBackup = (
  linodeID: number,
  backupID: number,
  targetLinodeID: number,
  overwrite: boolean,
) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/backups/${backupID}/restore`),
    setMethod('POST'),
    setData({ linodeId: targetLinodeID, overwrite }),
  )
    .then(response => response.data);

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

export interface LinodeDiskCreationData {
  label: string;
  size: number;
  filesystem?: string;
}

export const listLinodeDisks = (
  linodeId: number,
) => Request<Page<Disk>>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
  setMethod('GET'),
  );

export const createLinodeDisk = (
  linodeId: number,
  data: LinodeDiskCreationData,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
  setMethod('POST'),
  setData(data),
  );

export const getLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('GET'),
  );

export const updateLinodeDisk = (
  linodeId: number,
  diskId: number,
  data: Pick<LinodeDiskCreationData, 'label'>,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('PUT'),
  setData(data),
  );

const resizeLinodeDiskSchema = Joi.object({
  size: Joi.number().required().min(1),
});

export const resizeLinodeDisk = (linodeId: number, diskId: number, size: number) =>
  Request<Linode.Disk>(
    validateRequestData({ size }, resizeLinodeDiskSchema),
    setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/resize`),
    setMethod('POST'),
    setData({ size }),
  );

export const deleteLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request<{}>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('DELETE'),
  );

export interface LinodeCloneData {
  // linode_id is missing here beacuse we removed the ability
  // to clone to an existing linode
  region?: string | null;
  type?: string | null;
  label?: string | null;
  backups_enabled?: boolean | null;
}

export const cloneLinode = (source_linode_id: number, data: LinodeCloneData) => {
  return Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${source_linode_id}/clone`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);
};
