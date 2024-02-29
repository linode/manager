import {
  APIError,
  Firewall,
  ResourcePage,
  getLinodeFirewalls,
} from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { queryKey } from './linodes';

export const useLinodeFirewallsQuery = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'linode', linodeID, 'firewalls'],
    () => getLinodeFirewalls(linodeID),
    queryPresets.oneTimeFetch
  );
