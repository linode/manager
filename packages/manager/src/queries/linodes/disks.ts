import {
  changeLinodeDiskPassword,
  createLinodeDisk,
  deleteLinodeDisk,
  resizeLinodeDisk,
  updateLinodeDisk,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError, Disk, LinodeDiskCreationData } from '@linode/api-v4';

export const useAllLinodeDisksQuery = (id: number, enabled = true) => {
  return useQuery<Disk[], APIError[]>({
    ...linodeQueries.linode(id)._ctx.disks,
    enabled,
  });
};

export const useLinodeDiskChangePasswordMutation = (
  linodeId: number,
  diskId: number
) =>
  useMutation<Disk, APIError[], { password: string }>({
    mutationFn: ({ password }) =>
      changeLinodeDiskPassword(linodeId, diskId, password),
  });

export const useLinodeDeleteDiskMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteLinodeDisk(linodeId, diskId),
    onSuccess() {
      queryClient.invalidateQueries(linodeQueries.linode(linodeId)._ctx.disks);
    },
  });
};

export const useLinodeDiskCreateMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, APIError[], LinodeDiskCreationData>({
    mutationFn: (data) => createLinodeDisk(linodeId, data),
    onSuccess() {
      queryClient.invalidateQueries(linodeQueries.linode(linodeId)._ctx.disks);
    },
  });
};

export const useLinodeDiskUpdateMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, APIError[], { label: string }>({
    mutationFn: (data) => updateLinodeDisk(linodeId, diskId, data),
    onSuccess() {
      queryClient.invalidateQueries(linodeQueries.linode(linodeId)._ctx.disks);
    },
  });
};

export const useLinodeDiskResizeMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, APIError[], { size: number }>({
    mutationFn: ({ size }) => resizeLinodeDisk(linodeId, diskId, size),
    onSuccess() {
      queryClient.invalidateQueries(linodeQueries.linode(linodeId)._ctx.disks);
    },
  });
};
