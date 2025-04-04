import {
  createLinodeInterface,
  deleteLinodeInterface,
  upgradeToLinodeInterface,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type {
  APIError,
  CreateLinodeInterfacePayload,
  Firewall,
  LinodeInterface,
  LinodeInterfaces,
  ResourcePage,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
} from '@linode/api-v4';
import type { UseMutationOptions } from '@tanstack/react-query';

export const useLinodeInterfacesQuery = (
  linodeId: number,
  enabled: boolean = true
) => {
  return useQuery<LinodeInterfaces, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces,
    enabled,
  });
};

export const useLinodeInterfaceQuery = (
  linodeId: number,
  interfaceId: number | undefined,
  enabled: boolean = true
) => {
  return useQuery<LinodeInterface, APIError[]>({
    ...linodeQueries
      .linode(linodeId)
      ._ctx.interfaces._ctx.interface(interfaceId ?? -1),
    enabled: enabled && interfaceId !== undefined,
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

export const useUpgradeToLinodeInterfacesMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<UpgradeInterfaceData, APIError[], UpgradeInterfacePayload>(
    {
      mutationFn: (data) => upgradeToLinodeInterface(linodeId, data),
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.configs.queryKey,
        });
      },
    }
  );
};
