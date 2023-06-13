import { useMutation, useQuery } from 'react-query';
import { queryKey } from './linodes';
import { getAll } from 'src/utilities/getAll';
import {
  APIError,
  Disk,
  LinodeDiskCreationData,
  changeLinodeDiskPassword,
  createLinodeDisk,
  deleteLinodeDisk,
  getLinodeDisks,
  resizeLinodeDisk,
  updateLinodeDisk,
} from '@linode/api-v4';

export const useAllLinodeDisksQuery = (id: number, enabled = true) => {
  return useQuery<Disk[], APIError[]>(
    [queryKey, 'linode', id, 'disks', 'all'],
    () => getAllLinodeDisks(id),
    { enabled }
  );
};

const getAllLinodeDisks = (id: number) =>
  getAll<Disk>((params, filter) => getLinodeDisks(id, params, filter))().then(
    (data) => data.data
  );

export const useLinodeDiskChangePasswordMutation = (
  linodeId: number,
  diskId: number
) =>
  useMutation<Disk, APIError[], { password: string }>(({ password }) =>
    changeLinodeDiskPassword(linodeId, diskId, password)
  );

export const useLinodeDeleteDiskMutation = (linodeId: number, diskId: number) =>
  useMutation<{}, APIError[]>(() => deleteLinodeDisk(linodeId, diskId));

export const useLinodeDiskCreateMutation = (linodeId: number) =>
  useMutation<Disk, APIError[], LinodeDiskCreationData>((data) =>
    createLinodeDisk(linodeId, data)
  );

export const useLinodeDiskUpdateMutation = (linodeId: number, diskId: number) =>
  useMutation<Disk, APIError[], { label: string }>((data) =>
    updateLinodeDisk(linodeId, diskId, data)
  );

export const useLinodeDiskResizeMutation = (linodeId: number, diskId: number) =>
  useMutation<Disk, APIError[], { size: number }>(({ size }) =>
    resizeLinodeDisk(linodeId, diskId, size)
  );
