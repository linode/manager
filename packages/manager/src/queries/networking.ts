import { getIPv6Ranges, IPRange } from '@linode/api-v4/lib/networking';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const ipv6RangeQueryKey = 'networking-ipv6-ranges';

export const useIpv6RangesQuery = () => {
  return useQuery<ResourcePage<IPRange>, APIError[]>(
    [ipv6RangeQueryKey],
    () => getIPv6Ranges(),
    {
      ...queryPresets.oneTimeFetch,
    }
  );
};
