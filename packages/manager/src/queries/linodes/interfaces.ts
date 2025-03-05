import { createLinodeInterface, deleteLinodeInterface } from '@linode/api-v4';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type {
  APIError,
  CreateLinodeInterfacePayload,
  Firewall,
  LinodeInterface,
  LinodeInterfaces,
  ResourcePage,
} from '@linode/api-v4';

export const useLinodeInterfacesQuery = (linodeId: number) => {
  return useQuery<LinodeInterfaces, APIError[]>(
    linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces
  );
};

export const useLinodeInterfaceQuery = (
  linodeId: number,
  interfaceId: number
) => {
  return useQuery<LinodeInterface, APIError[]>({
    ...linodeQueries
      .linode(linodeId)
      ._ctx.interfaces._ctx.interface(interfaceId),
    enabled: Boolean(interfaceId),
  });
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

export const useCreateLinodeInterfaceMutation = (linodeId: number) => {
  const queryClient = useQueryClient();

  return useMutation<LinodeInterface, APIError[], CreateLinodeInterfacePayload>(
    {
      mutationFn: (data) => createLinodeInterface(linodeId, data),
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.interfaces.queryKey,
        });
      },
    }
  );
};

export const useDeleteLinodeInterfaceMutation = (
  linodeId: number,
  options?: UseMutationOptions<{}, APIError[], number>
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], number>({
    mutationFn: (interfaceId) => deleteLinodeInterface(linodeId, interfaceId),
    ...options,
    onSuccess(...params) {
      options?.onSuccess?.(...params);
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.interfaces.queryKey,
      });
    },
  });
};
