import * as Bluebird from 'bluebird';
import { omit, range } from 'ramda';
import { number, object, string } from 'yup';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '.';

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

export const getLinodeConfig = (linodeId: number, configId: number) =>
  Request<Config>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
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

export const getLinodeDisks = (id: number, params: any = {}, filters: any = {}) =>
  Request<Page<Linode.Disk>>(
    setURL(`${API_ROOT}/linode/instances/${id}/disks`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
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

export const rebuildLinode = (id: number, image: string, password: string, users: string[] = []) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/rebuild`),
    setMethod('POST'),
    setData({ image, root_pass: password, authorized_users: users }),
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

const CreateLinodeSchema = object().shape({
  type: string()
    .ensure()
    .required('Plan is required.'),
  region: string()
    .ensure()
    .required('Region is required.'),
});

export const createLinode = (data: any) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances`),
    setMethod('POST'),
    setData(data, CreateLinodeSchema),
  )
    .then(response => response.data);

export const getLinodeKernels = (params: any = {}, filters: any = {}) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  )
    .then(response => response.data);

export const getAllKernels: (params?: any, filters?: any) => Promise<Linode.Kernel[]> =
  (linodeId, params = {}, filters = {}) => {
    const pagination = { ...params, page_size: 100 };

    return getLinodeKernels(params, filters)
      .then(({ data: firstPageData, page, pages }) => {

        // If we only have one page, return it.
        if (page === pages) { return firstPageData; }

        // Create an iterable list of the remaining pages.
        const remainingPages = range(page + 1, pages + 1);

        //
        return Bluebird
          .map(remainingPages, nextPage =>
            getLinodeKernels({ ...pagination, page: nextPage }, filters).then(response => response.data),
          )
          .then(pages => pages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
      });
  }

export const getLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getDeprecatedLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types-legacy`),
    setMethod('GET')
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

export const updateLinode = (id: number, values: Partial<Linode>) =>
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

/** @todo type */
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

export const updateLinodeConfig = (linodeId: number, configId: number, data: LinodeConfigCreationData) =>
  Request<Config>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/configs/${configId}`),
    setMethod('PUT'),
    setData(data),
  );

export interface LinodeDiskCreationData {
  label: string;
  size: number;
  filesystem?: string;
}

export const listLinodeDisks = (linodeId: number, params: any = {}, filters: any = {}) =>
  Request<Page<Disk>>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );


export const getAllLinodeDisks: (linodeId: number, params?: any, filters?: any) => Promise<Linode.Disk[]> =
  (linodeId, params = {}, filters = {}) => {
    const pagination = { ...params, page_size: 100 };

    return listLinodeDisks(linodeId, pagination, filters)
      .then(response => response.data)
      .then(({ data: firstPageData, page, pages }) => {

        // If we only have one page, return it.
        if (page === pages) { return firstPageData; }

        // Create an iterable list of the remaining pages.
        const remainingPages = range(page + 1, pages + 1);

        //
        return Bluebird
          .map(remainingPages, nextPage =>
            listLinodeDisks(linodeId, { ...pagination, page: nextPage }, filters).then(response => response.data.data),
          )
          /** We're given Linode.Volume[][], so we flatten that, and append the first page response. */
          .then(pages => pages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
      });
  }


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

const resizeLinodeDiskSchema = object({
  size: number().required().min(1),
});

export const resizeLinodeDisk = (linodeId: number, diskId: number, size: number) =>
  Request<Linode.Disk>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/resize`),
    setMethod('POST'),
    setData({ size }, resizeLinodeDiskSchema),
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

export const cloneLinode = (sourceLinodeId: number, data: LinodeCloneData) => {
  return Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${sourceLinodeId}/clone`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);
};

export const startMutation = (linodeID: number) => {
  return Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/mutate`),
    setMethod('POST'),
  )
    .then(response => response.data)
}
