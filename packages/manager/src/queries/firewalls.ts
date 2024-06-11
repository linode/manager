import {
  addFirewallDevice,
  createFirewall,
  deleteFirewall,
  deleteFirewallDevice,
  getFirewall,
  getFirewallDevices,
  getFirewalls,
  updateFirewall,
  updateFirewallRules,
} from '@linode/api-v4/lib/firewalls';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { getAll } from 'src/utilities/getAll';

import { profileQueries } from './profile/profile';

import type {
  APIError,
  CreateFirewallPayload,
  Filter,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
  Params,
  ResourcePage,
} from '@linode/api-v4';
import type { EventHandlerData } from 'src/hooks/useEventHandlers';

const getAllFirewallDevices = (
  id: number,
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<FirewallDevice>((params, filter) =>
    getFirewallDevices(
      id,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);

const getAllFirewallsRequest = () =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(passedParams, passedFilter)
  )().then((data) => data.data);

export const firewallQueries = createQueryKeys('firewalls', {
  firewall: (id: number) => ({
    contextQueries: {
      devices: {
        queryFn: () => getAllFirewallDevices(id),
        queryKey: null,
      },
    },
    queryFn: () => getFirewall(id),
    queryKey: [id],
  }),
  firewalls: {
    contextQueries: {
      all: {
        queryFn: getAllFirewallsRequest,
        queryKey: null,
      },
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getFirewalls(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useAllFirewallDevicesQuery = (id: number) =>
  useQuery<FirewallDevice[], APIError[]>(
    firewallQueries.firewall(id)._ctx.devices
  );

export const useAddFirewallDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<FirewallDevice, APIError[], FirewallDevicePayload>({
    mutationFn: (data) => addFirewallDevice(id, data),
    onSuccess(firewallDevice) {
      // Append the new entity to the Firewall object in the paginated store
      queryClient.setQueriesData<ResourcePage<Firewall>>(
        firewallQueries.firewalls._ctx.paginated._def,
        (page) => {
          if (!page) {
            return undefined;
          }

          const indexOfFirewall = page.data.findIndex(
            (firewall) => firewall.id === id
          );

          // If the firewall does not exist on this page, don't change anything
          if (indexOfFirewall === -1) {
            return page;
          }

          const firewall = page.data[indexOfFirewall];

          const newData = [...page.data];

          newData[indexOfFirewall] = {
            ...firewall,
            entities: [...firewall.entities, firewallDevice.entity],
          };
          return { ...page, data: newData };
        }
      );

      // Append the new entity to the Firewall object in the "all firewalls" store
      queryClient.setQueryData<Firewall[]>(
        firewallQueries.firewalls._ctx.all.queryKey,
        (firewalls) => {
          if (!firewalls) {
            return undefined;
          }

          const indexOfFirewall = firewalls.findIndex(
            (firewall) => firewall.id === id
          );

          // If the firewall does not exist in the list, don't do anything
          if (indexOfFirewall === -1) {
            return firewalls;
          }

          const newFirewalls = [...firewalls];

          const firewall = firewalls[indexOfFirewall];

          newFirewalls[indexOfFirewall] = {
            ...firewall,
            entities: [...firewall.entities, firewallDevice.entity],
          };

          return newFirewalls;
        }
      );

      // Append the new entity to the Firewall object
      queryClient.setQueryData<Firewall>(
        firewallQueries.firewall(id).queryKey,
        (oldFirewall) => {
          if (!oldFirewall) {
            return undefined;
          }
          return {
            ...oldFirewall,
            entities: [...oldFirewall.entities, firewallDevice.entity],
          };
        }
      );

      // Add device to the dedicated devices store
      queryClient.setQueryData<FirewallDevice[]>(
        firewallQueries.firewall(id)._ctx.devices.queryKey,
        (existingFirewallDevices) => {
          if (!existingFirewallDevices) {
            return [firewallDevice];
          }
          return [...existingFirewallDevices, firewallDevice];
        }
      );

      // Refresh the cached result of the linode-specific firewalls query
      if (firewallDevice.entity.type === 'linode') {
        queryClient.invalidateQueries([
          linodesQueryKey,
          'linode',
          firewallDevice.entity.id,
          'firewalls',
        ]);
      }

      // Refresh the cached result of the nodebalancer-specific firewalls query
      if (firewallDevice.entity.type === 'nodebalancer') {
        // @todo: add this invalidation
      }
    },
  });
};

export const useRemoveFirewallDeviceMutation = (
  firewallId: number,
  deviceId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteFirewallDevice(firewallId, deviceId),
    onSuccess() {
      // Invalidate firewall lists because GET /v4/firewalls returns all entities for each firewall
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });

      // Invalidate the firewall because the firewall objects has all entities and we want them to be in sync
      queryClient.invalidateQueries({
        exact: true,
        queryKey: firewallQueries.firewall(firewallId).queryKey,
      });

      // Remove device from the firewall's dedicaed devices store
      queryClient.setQueryData<FirewallDevice[]>(
        firewallQueries.firewall(firewallId)._ctx.devices.queryKey,
        (oldData) => {
          return oldData?.filter((device) => device.id !== deviceId) ?? [];
        }
      );
    },
  });
};

export const useFirewallsQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Firewall>, APIError[]>({
    ...firewallQueries.firewalls._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useFirewallQuery = (id: number) =>
  useQuery<Firewall, APIError[]>(firewallQueries.firewall(id));

export const useAllFirewallsQuery = (enabled: boolean = true) => {
  return useQuery<Firewall[], APIError[]>({
    ...firewallQueries.firewalls._ctx.all,
    enabled,
  });
};

export const useMutateFirewall = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Firewall, APIError[], Partial<Firewall>>({
    mutationFn: (data) => updateFirewall(id, data),
    onSuccess(firewall) {
      // Update the firewall in the store
      queryClient.setQueryData<Firewall>(
        firewallQueries.firewall(firewall.id).queryKey,
        firewall
      );

      // Invalidate firewall lists
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });
    },
  });
};

export const useCreateFirewall = () => {
  const queryClient = useQueryClient();
  return useMutation<Firewall, APIError[], CreateFirewallPayload>({
    mutationFn: createFirewall,
    onSuccess(firewall) {
      // Invalidate firewall lists
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });

      // Set the firewall in the store
      queryClient.setQueryData<Firewall>(
        firewallQueries.firewall(firewall.id).queryKey,
        firewall
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useDeleteFirewall = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteFirewall(id),
    onSuccess() {
      // Remove firewall and its subqueries from the cache
      queryClient.removeQueries({
        queryKey: firewallQueries.firewall(id).queryKey,
      });

      // Invalidate firewall lists
      queryClient.invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });
    },
  });
};

export const useUpdateFirewallRulesMutation = (firewallId: number) => {
  const queryClient = useQueryClient();
  return useMutation<FirewallRules, APIError[], FirewallRules>({
    mutationFn: (data) => updateFirewallRules(firewallId, data),
    onSuccess(updatedRules) {
      // Update rules on specific firewall
      queryClient.setQueryData<Firewall | undefined>(
        firewallQueries.firewall(firewallId).queryKey,
        (oldData) => {
          if (!oldData) {
            return undefined;
          }
          return { ...oldData, rules: updatedRules };
        }
      );

      // Update the Firewall object in the paginated store
      queryClient.setQueriesData<ResourcePage<Firewall>>(
        firewallQueries.firewalls._ctx.paginated._def,
        (page) => {
          if (!page) {
            return undefined;
          }

          const indexOfFirewall = page.data.findIndex(
            (firewall) => firewall.id === firewallId
          );

          // If the firewall does not exist on this page, don't change anything
          if (indexOfFirewall === -1) {
            return page;
          }

          const firewall = page.data[indexOfFirewall];

          const newData = [...page.data];

          newData[indexOfFirewall] = {
            ...firewall,
            rules: updatedRules,
          };
          return { ...page, data: newData };
        }
      );

      // Update the the Firewall object in the "all firewalls" store
      queryClient.setQueryData<Firewall[]>(
        firewallQueries.firewalls._ctx.all.queryKey,
        (firewalls) => {
          if (!firewalls) {
            return undefined;
          }

          const indexOfFirewall = firewalls.findIndex(
            (firewall) => firewall.id === firewallId
          );

          // If the firewall does not exist in the list, don't do anything
          if (indexOfFirewall === -1) {
            return firewalls;
          }

          const newFirewalls = [...firewalls];

          const firewall = firewalls[indexOfFirewall];

          newFirewalls[indexOfFirewall] = {
            ...firewall,
            rules: updatedRules,
          };

          return newFirewalls;
        }
      );
    },
  });
};

export const firewallEventsHandler = ({ queryClient }: EventHandlerData) => {
  // We will over-fetch a little bit, bit this ensures Cloud firewalls are *always* up to date
  queryClient.invalidateQueries({ queryKey: firewallQueries._def });
};
