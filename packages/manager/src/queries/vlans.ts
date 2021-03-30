import { getVlans, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import useFlags from 'src/hooks/useFlags';
import { queryPresets } from './base';

export const _getVlans = (): Promise<VLAN[]> =>
  getVlans().then(({ data }) => data);

export const useVlansQuery = () => {
  // Using the flag directly so we can control this independently from account.capabilities
  const flags = useFlags();
  return useQuery<VLAN[], APIError[]>('vlans', _getVlans, {
    ...queryPresets.longLived,
    enabled: flags.vlans,
  });
};

export default useVlansQuery;
