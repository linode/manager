import { getRegions, Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

import { data } from 'src/cachedData/regions.json';

export const _getRegions = () => getRegions().then(({ data }) => data);

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>('managedSSHKey', _getRegions, {
    ...queryPresets.longLived,
    placeholderData: data as Region[]
  });
