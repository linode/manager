import {
  Disk,
  LinodeDiskCreationData,
  changeLinodeDiskPassword,
  createLinodeDisk,
  deleteLinodeDisk,
  getLinodeDisks,
  resizeLinodeDisk,
  updateLinodeDisk,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryKey } from './linodes';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAllLinodeDisksQuery = (id: number, enabled = true) => {
  return useQuery<Disk[], FormattedAPIError[]>(
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
  useMutation<Disk, FormattedAPIError[], { password: string }>(({ password }) =>
    changeLinodeDiskPassword(linodeId, diskId, password)
  );

export const useLinodeDeleteDiskMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLinodeDisk(linodeId, diskId),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
      },
    }
  );
};

export const useLinodeDiskCreateMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, FormattedAPIError[], LinodeDiskCreationData>(
    (data) => createLinodeDisk(linodeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
      },
    }
  );
};

export const useLinodeDiskUpdateMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, FormattedAPIError[], { label: string }>(
    (data) => updateLinodeDisk(linodeId, diskId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
      },
    }
  );
};

export const useLinodeDiskResizeMutation = (
  linodeId: number,
  diskId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Disk, FormattedAPIError[], { size: number }>(
    ({ size }) => resizeLinodeDisk(linodeId, diskId, size),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
      },
    }
  );
};
