import { useMutation, useQuery } from 'react-query';
import { queryKey } from './linodes';
import { getAll } from 'src/utilities/getAll';
import {
  APIError,
  Disk,
  changeLinodeDiskPassword,
  getLinodeDisks,
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
