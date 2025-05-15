import { useQuery } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError, Firewall, ResourcePage } from '@linode/api-v4';

export const useLinodeFirewallsQuery = (
  linodeId: number,
  enabled: boolean = true,
) =>
  useQuery<ResourcePage<Firewall>, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.firewalls,
    enabled,
  });
