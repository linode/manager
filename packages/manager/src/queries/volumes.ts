import { getVolumes, Volume } from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const queryKey = 'volumes';

export const useVolumesQuery = (params: any, filters: any) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );
