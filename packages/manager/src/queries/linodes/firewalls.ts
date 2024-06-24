import { getLinodeFirewalls } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryKey } from './linodes';

import type { APIError, Firewall, ResourcePage } from '@linode/api-v4';

export const useLinodeFirewallsQuery = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'linode', linodeID, 'firewalls'],
    () => getLinodeFirewalls(linodeID)
  );
