import { getVlans, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const queryKey = 'vlans';

export const _getVlans = (): Promise<VLAN[]> =>
  getVlans().then(({ data }) => data);

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(queryKey, _getVlans, {
    ...queryPresets.longLived,
  });
};

export default useVlansQuery;
