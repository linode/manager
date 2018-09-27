import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

import { resizeLinodeDiskSchema } from './linode.schema';

type Page<T> = Linode.ResourcePage<T>;
type Disk = Linode.Disk;

export interface LinodeDiskCreationData {
  label: string;
  size: number;
  filesystem?: string;
}

export const getLinodeDisks = (id: number) =>
  Request<Page<Linode.Disk>>(
    setURL(`${API_ROOT}/linode/instances/${id}/disks`),
    setMethod('GET'),
  )
    .then(response => response.data);

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