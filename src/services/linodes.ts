import Axios, { AxiosPromise } from 'axios';
import { omit } from 'ramda';
import { API_ROOT } from 'src/constants';
import Request, { genAxiosConfig, setData, setURL, setMethod, setXFilter } from '.';

/* tslint:disable-next-line */
export type RescueRequestObject = Pick<Linode.Devices, 'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'>
export const rescueLinode = (linodeId: number, devices: RescueRequestObject): Promise<{}> =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/rescue`),
    setMethod('POST'),
    setData({ devices: omit(['sdh'], devices) }),
  );

type GetLinodeType = Promise<Linode.ResourcePage<Linode.Config>>;

export const getLinodeConfigs = (id: number): GetLinodeType => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/configs`),
  setMethod('GET'),
)
  .then(response => response.data);

type GetLinode = Promise<Linode.SingleResourceState<Linode.Linode>>;
export const getLinode = (id: number): GetLinode => Request(
  setURL(`${API_ROOT}/linode/instances/${id}`),
  setMethod('GET'),
);

type GetLinodeVolumesType = Promise<Linode.ResourcePage<Linode.Volume>>;
export const getLinodeVolumes = (id: number): GetLinodeVolumesType => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/volumes`),
  setMethod('GET'),
)
  .then(response => response.data);

type GetLinodeDisksType = Promise<Linode.ResourcePage<Linode.Disk>>;
export const getLinodeDisks = (id: number): GetLinodeDisksType => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/disks`),
  setMethod('GET'),
)
  .then(response => response.data);

type GetLinodeBackupsType = Promise<Linode.LinodeBackupsResponse>;
export const getLinodeBackups = (id: number): GetLinodeBackupsType => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/backups`),
  setMethod('GET'),
)
  .then(response => response.data);

export const enableBackups = (id: number): AxiosPromise => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/backups/enable`),
  setMethod('POST'),
);

export const cancelBackups = (id: number): AxiosPromise => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/backups/cancel`),
  setMethod('POST'),
);

export const takeSnapshot = (id: number, label: string): AxiosPromise => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/backups`),
  setMethod('POST'),
  setData({ label }),
);

// export const updateBackupsWindow = (id: number, day: string, window: string): AxiosPromise =>
//   Axios.put(`${API_ROOT}/linode/instances/${id}`,
//     { backups: { schedule: { day, window } } });

export const updateBackupsWindow = (id: number, day: string, window: string): AxiosPromise =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('PUT'),
    setData({ backups: { schedule: { day, window } } }),
  );

export const getLinodeIPs = (id: number): Promise<Linode.LinodeIPsResponse> => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/ips`),
  setMethod('GET'),
)
  .then(response => response.data);

export const allocatePrivateIP = (linodeID: number) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
  setMethod('POST'),
  setData({ type: 'ipv4', public: false }),
).then(response => response.data);

export const allocatePublicIP = (linodeID: number) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
  setMethod('POST'),
  setData({ type: 'ipv4', public: false }),
).then(response => response.data);

type RebuildLinodeType = Promise<{}>;
export const rebuildLinode = (id: number, image: string, password: string): RebuildLinodeType =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${id}/rebuild`),
    setMethod('POST'),
    setData({ image, root_pass: password }),
  ).then(response => response.data);

export const resizeLinode = (id: number, type: string): Promise<{}> => Request(
  setURL(`${API_ROOT}/linode/instances/${id}/resize`),
  setMethod('POST'),
  setData({ type }),
);

type GetLinodes = Promise<Linode.ResourcePage<Linode.Linode>>;
export const getLinodes = (params?: any, filter?: any): GetLinodes => Request(
  setURL(`${API_ROOT}/linode/instances/`),
  setMethod('GET'),

  () => (filter) && setXFilter(filter),
)
  .then(response => response.data);
// Axios.get(`${API_ROOT}/linode/instances/`, genAxiosConfig(params, filter))
//   .then(response => response.data);

type GetLinodesPage = Promise<Linode.ResourcePage<Linode.Linode>>;
export const getLinodesPage = (page: number): GetLinodesPage =>
  Axios.get(`${API_ROOT}/linode/instances/`, genAxiosConfig({ page }))
    .then(response => response.data);

export const createLinode = (data: any): Promise<Linode.Linode> =>
  Axios.post(`${API_ROOT}/linode/instances`, data)
    .then(response => response.data);

export const getLinodeTypes = (): Promise<Linode.ResourcePage<Linode.LinodeType>> =>
  Axios.get(`${API_ROOT}/linode/types`)
    .then(response => response.data);

type GetType = Promise<Linode.LinodeType>;
export const getType = (typeId: string): GetType =>
  Axios.get(`${API_ROOT}/linode/types/${typeId}`)
    .then(response => response.data);

type RenameLinodeType = Promise<Linode.SingleResourceState<Linode.Linode>>;
export const renameLinode = (linodeId: number, label: string): RenameLinodeType =>
  Axios.put(`${API_ROOT}/linode/instances/${linodeId}`, { label })
    .then(response => response.data);

/** @todo TYPE */
export const getLinodeStats = (linodeId: number, year?: string, month?: string) => {
  if (year && month) {
    return Axios.get(`${API_ROOT}/linode/instances/${linodeId}/stats/${year}/${month}`);
  }

  return Axios.get(`${API_ROOT}/linode/instances/${linodeId}/stats`);
};

export const updateLinode =
  (id: number, values: any): Promise<Linode.SingleResourceState<Linode.Linode>> =>
    Axios.put(`${API_ROOT}/linode/instances/${id}`, values);

type DiskResponse = Promise<Linode.SingleResourceState<Linode.Disk>>;
export const changeLinodeDiskPassword = (
  linodeId: number,
  diskId: number,
  password: string,
): DiskResponse =>
  Axios.post(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/password`, { password })
    .then(response => response.data);

export const deleteLinode = (linodeId: number): Promise<{}> =>
  Axios.delete(`${API_ROOT}/linode/instances/${linodeId}`);

export const restoreBackup = (
  linodeID: number,
  backupID: number,
  targetLinodeID: number,
  overwrite: boolean,
) => {
  return Axios.post(`${API_ROOT}/linode/instances/${linodeID}/backups/${backupID}/restore`,
    { linode_id: targetLinodeID, overwrite })
    .then(response => response.data);
};

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

export const createLinodeConfig = (linodeId: number, data: LinodeConfigCreationData) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/configs`),
  setMethod('POST'),
  setData(data),
);

export const deleteLinodeConfig = (linodeId: number, configId: number) => Request(
  setMethod('DELETE'),
  setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
);

export const updateLinodeConfig = (
  linodeId: number,
  configId: number,
  data: LinodeConfigCreationData,
) => Request(
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
) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
  setMethod('GET'),
  );

export const createLinodeDisk = (
  linodeId: number,
  data: LinodeDiskCreationData,
) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
  setMethod('POST'),
  setData(data),
  );

export const getLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('GET'),
  );

export const updateLinodeDisk = (
  linodeId: number,
  diskId: number,
  data: Pick<LinodeDiskCreationData, 'label'>,
) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('PUT'),
  setData(data),
  );

export const deleteLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('DELETE'),
  );

