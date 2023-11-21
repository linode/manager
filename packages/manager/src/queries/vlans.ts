import { APIError } from '@linode/api-v4/lib/types';
import { VLAN, getVlans } from '@linode/api-v4/lib/vlans';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

export const queryKey = 'vlans';

const _getVlans = (): Promise<VLAN[]> =>
  getAll<VLAN>((params) => getVlans(params))().then(({ data }) => data);

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(queryKey, _getVlans, {
    ...queryPresets.longLived,
  });
};
