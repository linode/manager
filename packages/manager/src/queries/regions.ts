import { getRegions, Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { dcDisplayNames } from 'src/constants';
import { queryClient, queryPresets } from './base';

export interface ExtendedRegion extends Region {
  display: string;
}

import { data } from 'src/cachedData/regions.json';

const extendRegion = (region: Region): ExtendedRegion => ({
  ...region,
  display: dcDisplayNames[region.id],
});

const cachedData = data.map(extendRegion);

export const _getRegions = () =>
  getRegions().then(({ data }) => data.map(extendRegion));

export const useRegionsQuery = () =>
  useQuery<ExtendedRegion[], APIError[]>('regions', _getRegions, {
    ...queryPresets.longLived,
    placeholderData: cachedData as ExtendedRegion[],
    onError: () => {
      queryClient.setQueryData('regions', cachedData as Region[]);
    },
  });
