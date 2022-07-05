import { getLinodeFirewalls } from '@linode/api-v4';
import { Firewall } from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

const queryKey = 'queryLinodeFirewalls';

export const useLinodeFirewalls = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, linodeID],
    () => getLinodeFirewalls(linodeID),
    queryPresets.oneTimeFetch
  );
