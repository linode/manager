import { Firewall, ResourcePage, getLinodeFirewalls } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { queryKey } from './linodes';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useLinodeFirewallsQuery = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, FormattedAPIError[]>(
    [queryKey, 'linode', linodeID, 'firewalls'],
    () => getLinodeFirewalls(linodeID),
    queryPresets.oneTimeFetch
  );
