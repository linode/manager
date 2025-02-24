import { useQuery } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type {
  APIError,
  Firewall,
  LinodeInterfaceHistory,
  LinodeInterfaces,
  ResourcePage,
} from '@linode/api-v4';

export const useLinodeInterfacesQuery = (linodeId: number) => {
  return useQuery<LinodeInterfaces, APIError[]>(
    linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces
  );
};

export const useLinodeInterfaceFirewallsQuery = (
  linodeId: number,
  interfaceId: number
) => {
  return useQuery<ResourcePage<Firewall>, APIError[]>(
    linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interface(interfaceId)
      ._ctx.firewalls
  );
};

export const useLinodeInterfacesHistory = (
  linodeId: number,
  enabled = true
) => {
  return useQuery<ResourcePage<LinodeInterfaceHistory>, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfacesHistory,
    enabled,
  });
};
