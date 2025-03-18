import {
  addFirewallDevice,
  createFirewall,
  deleteFirewall,
  deleteFirewallDevice,
  getFirewall,
  getFirewallDevices,
  getFirewalls,
  getTemplate,
  getTemplates,
  updateFirewall,
  updateFirewallRules,
} from '@linode/api-v4/lib/firewalls';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { linodeQueries } from '../linodes';
import { nodebalancerQueries } from '../nodebalancers';
import { profileQueries } from '../profile';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  CreateFirewallPayload,
  Filter,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
  FirewallTemplate,
  FirewallTemplateSlug,
  Params,
  ResourcePage,
  UpdateFirewallRules,
} from '@linode/api-v4';

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

const getAllFirewallTemplates = () =>
  getAll<FirewallTemplate>(getTemplates)().then((data) => data.data);

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
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getFirewalls({ page: pageParam as number }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getFirewalls(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  template: (slug: FirewallTemplateSlug) => ({
    queryFn: () => getTemplate(slug),
    queryKey: [slug],
  }),
  templates: {
    queryFn: getAllFirewallTemplates,
    queryKey: null,
  },
});

export const useAllFirewallDevicesQuery = (id: number) =>
  useQuery<FirewallDevice[], APIError[]>(
    firewallQueries.firewall(id)._ctx.devices
  );

export const useFirewallsInfiniteQuery = (filter: Filter, enabled: boolean) => {
  return useInfiniteQuery<ResourcePage<Firewall>, APIError[]>({
    ...firewallQueries.firewalls._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
};

export const useAddFirewallDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FirewallDevice,
    APIError[],
    FirewallDevicePayload & { firewallId: number }
  >({
    mutationFn: ({ firewallId, ...data }) =>
      addFirewallDevice(firewallId, data),
    onSuccess(firewallDevice, vars) {
      const id = vars.firewallId;
      // Append the new entity to the Firewall object in the paginated store
      queryClient.setQueriesData<ResourcePage<Firewall>>(
        { queryKey: firewallQueries.firewalls._ctx.paginated._def },
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
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(firewallDevice.entity.id)._ctx
            .firewalls.queryKey,
        });
      }

      // Refresh the cached result of the nodebalancer-specific firewalls query
      if (firewallDevice.entity.type === 'nodebalancer') {
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(firewallDevice.entity.id)
            ._ctx.firewalls.queryKey,
        });
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
    placeholderData: keepPreviousData,
  });
};

export const useFirewallTemplatesQuery = () => {
  return useQuery<FirewallTemplate[], APIError[]>({
    ...firewallQueries.templates,
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

      // For each entity attached to the firewall upon creation, invalidate
      // the entity's firewall query so that firewalls are up to date
      // on the entity's details/settings page.
      for (const entity of firewall.entities) {
        if (entity.type === 'linode') {
          queryClient.invalidateQueries({
            queryKey: linodeQueries.linode(entity.id)._ctx.firewalls.queryKey,
          });
        }
        if (entity.type === 'nodebalancer') {
          queryClient.invalidateQueries({
            queryKey: nodebalancerQueries.nodebalancer(entity.id)._ctx.firewalls
              .queryKey,
          });
        }
      }
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
  return useMutation<FirewallRules, APIError[], UpdateFirewallRules>({
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
        { queryKey: firewallQueries.firewalls._ctx.paginated._def },
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

export const firewallEventsHandler = ({
  event,
  invalidateQueries,
  queryClient,
}: EventHandlerData) => {
  if (!event.entity) {
    // Ignore any events that don't have an associated entity
    return;
  }

  switch (event.action) {
    case 'firewall_delete':
      // Invalidate firewall lists
      invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });

      // Remove firewall from the cache
      queryClient.removeQueries({
        queryKey: firewallQueries.firewall(event.entity.id).queryKey,
      });
    case 'firewall_create':
      // Invalidate firewall lists
      invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });
    case 'firewall_device_add':
    case 'firewall_device_remove':
      // For a firewall device event, the primary entity is the fireall and
      // the secondary entity is the device that is added/removed

      // If a Linode is added or removed as a firewall device, invalidate it's firewalls
      if (event.secondary_entity && event.secondary_entity.type === 'linode') {
        invalidateQueries({
          queryKey: linodeQueries.linode(event.secondary_entity.id)._ctx
            .firewalls.queryKey,
        });
      }

      // If a NodeBalancer is added or removed as a firewall device, invalidate it's firewalls
      if (
        event.secondary_entity &&
        event.secondary_entity.type === 'nodebalancer'
      ) {
        invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(event.secondary_entity.id)
            ._ctx.firewalls.queryKey,
        });
      }

      // Invalidate the firewall
      invalidateQueries({
        queryKey: firewallQueries.firewall(event.entity.id).queryKey,
      });

      // Invalidate firewall lists
      invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });
    case 'firewall_disable':
    case 'firewall_enable':
    case 'firewall_rules_update':
    case 'firewall_update':
      // invalidate the firewall
      invalidateQueries({
        queryKey: firewallQueries.firewall(event.entity.id).queryKey,
      });
      // Invalidate firewall lists
      invalidateQueries({
        queryKey: firewallQueries.firewalls.queryKey,
      });
  }
};
