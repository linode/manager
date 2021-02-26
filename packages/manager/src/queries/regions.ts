import { getRegions, Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';

import { data as cachedData } from 'src/cachedData/regions.json';

export const _getRegions = () => getRegions().then(({ data }) => data);

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>('regions', _getRegions, {
    ...queryPresets.longLived,
    placeholderData: cachedData as Region[],
    onError: () => {
      queryClient.setQueryData('regions', cachedData as Region[]);
    },
  });
