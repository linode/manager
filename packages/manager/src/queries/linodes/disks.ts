import { APIError, Disk, getLinodeDisks } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { queryKey } from './linodes';
import { getAll } from 'src/utilities/getAll';

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
