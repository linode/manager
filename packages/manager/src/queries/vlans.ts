import { getVlans, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';
import { getAll } from 'src/utilities/getAll';

export const queryKey = 'vlans';

const _getVlans = (): Promise<VLAN[]> =>
  getAll<VLAN>((params) => getVlans(params))().then(({ data }) => data);

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(queryKey, _getVlans, {
    ...queryPresets.longLived,
  });
};
