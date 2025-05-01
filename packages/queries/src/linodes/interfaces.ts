import {
  createLinodeInterface,
  deleteLinodeInterface,
  updateLinodeInterface,
  updateLinodeInterfacesSettings,
  upgradeToLinodeInterface,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { firewallQueries } from '../firewalls';
import { networkingQueries } from '../networking';
import { linodeQueries } from './linodes';

import type {
  APIError,
  CreateLinodeInterfacePayload,
  Firewall,
  LinodeInterface,
  LinodeInterfaces,
  LinodeInterfaceSettings,
  LinodeInterfaceSettingsPayload,
  ModifyLinodeInterfacePayload,
  ResourcePage,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
} from '@linode/api-v4';
import type { UseMutationOptions } from '@tanstack/react-query';

export const useLinodeInterfacesQuery = (
  linodeId: number,
  enabled: boolean = true,
) => {
  return useQuery<LinodeInterfaces, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces,
    enabled,
  });
};

export const useLinodeInterfaceQuery = (
  linodeId: number,
  interfaceId: number | undefined,
  enabled: boolean = true,
) => {
  return useQuery<LinodeInterface, APIError[]>({
    ...linodeQueries
      .linode(linodeId)
      ._ctx.interfaces._ctx.interface(interfaceId ?? -1),
    enabled: enabled && interfaceId !== undefined,
  });
};

export const useLinodeInterfaceSettingsQuery = (linodeId: number) => {
  return useQuery<LinodeInterfaceSettings, APIError[]>(
    linodeQueries.linode(linodeId)._ctx.interfaces._ctx.settings,
  );
};

export const useLinodeInterfaceSettingsMutation = (linodeId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    LinodeInterfaceSettings,
    APIError[],
    LinodeInterfaceSettingsPayload
  >({
    mutationFn: (data) => updateLinodeInterfacesSettings(linodeId, data),
    onSuccess(settings) {
      queryClient.setQueryData(
        linodeQueries.linode(linodeId)._ctx.interfaces._ctx.settings.queryKey,
        settings,
      );
      queryClient.invalidateQueries({
        queryKey:
          linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces
            .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey:
          linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interface._def,
      });
    },
  });
};

export const useLinodeInterfaceFirewallsQuery = (
  linodeId: number,
  interfaceId: number,
  enabled: boolean = true,
) => {
  return useQuery<ResourcePage<Firewall>, APIError[]>({
    ...linodeQueries
      .linode(linodeId)
      ._ctx.interfaces._ctx.interface(interfaceId)._ctx.firewalls,
    enabled,
  });
};

export const useCreateLinodeInterfaceMutation = (linodeId: number) => {
  const queryClient = useQueryClient();

  return useMutation<LinodeInterface, APIError[], CreateLinodeInterfacePayload>(
    {
      mutationFn: (data) => createLinodeInterface(linodeId, data),
      onSuccess(linodeInterface, variables) {
        // Invalidate the list of interfaces
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.interfaces.queryKey,
        });

        // Invalidate the Linode's IPs because adding a new interface likely adds IPs to the Linode
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
        });

        // Invaliate networking queries because IPs likely changed
        queryClient.invalidateQueries({
          queryKey: networkingQueries._def,
        });

        // Invalidate the Linode itself in case IPs changed
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId).queryKey,
          exact: true,
        });

        // If a Firewall is attached at the time of creation...
        if (variables.firewall_id) {
          // Invalidate all Firewall lists
          queryClient.invalidateQueries({
            queryKey: firewallQueries.firewalls.queryKey,
          });

          // Invalidate the specific firewall
          queryClient.invalidateQueries({
            queryKey: firewallQueries.firewall(variables.firewall_id).queryKey,
          });
        }
      },
    },
  );
};

export const useUpdateLinodeInterfaceMutation = (
  linodeId: number,
  interfaceId: number,
  options?: UseMutationOptions<
    LinodeInterface,
    APIError[],
    ModifyLinodeInterfacePayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<LinodeInterface, APIError[], ModifyLinodeInterfacePayload>(
    {
      mutationFn: (data) => updateLinodeInterface(linodeId, interfaceId, data),
      ...options,
      onSuccess(linodeInterface, variables, context) {
        options?.onSuccess?.(linodeInterface, variables, context);

        // Set the specific interface in the cache
        queryClient.setQueryData(
          linodeQueries
            .linode(linodeId)
            ._ctx.interfaces._ctx.interface(linodeInterface.id).queryKey,
          linodeInterface,
        );

        // Invalidate this Linode's interface queries
        queryClient.invalidateQueries({
          queryKey:
            linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces
              .queryKey,
        });

        // Invalidate a Linode's IPs because this edit action can change a Linode's IPs
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
        });

        // Invaliate networking queries because IPs likely changed
        queryClient.invalidateQueries({
          queryKey: networkingQueries._def,
        });

        // Invalidate the Linode itself
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId).queryKey,
          exact: true,
        });
      },
    },
  );
};

export const useDeleteLinodeInterfaceMutation = (
  linodeId: number,
  options?: UseMutationOptions<{}, APIError[], number>,
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], number>({
    mutationFn: (interfaceId) => deleteLinodeInterface(linodeId, interfaceId),
    ...options,
    onSuccess(...params) {
      options?.onSuccess?.(...params);

      // remove the cached interface
      queryClient.removeQueries({
        queryKey: linodeQueries
          .linode(linodeId)
          ._ctx.interfaces._ctx.interface(params[1]).queryKey,
      });

      // Invalidate the interfaces list
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.interfaces.queryKey,
      });

      // Invalidate a Linode's IPs because this edit action can change a Linode's IPs
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });

      // Because we don't easily know the interface's Firewall here,
      // we'll just invalidate all firewall queries.
      // If this ever needs to be optimized, we can fetch the interface's firewalls before deletion,
      // and do a more granular invalidation knowing the firewall ID.
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewall._def,
      });
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
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

        // queryClient.invalidateQueries({
        //   queryKey: linodeQueries.linode(linodeId)._ctx.firewalls.queryKey,
        // });
      },
    },
  );
};
