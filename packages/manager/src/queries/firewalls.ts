import {
  CreateFirewallPayload,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
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
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { EventWithStore } from 'src/events';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { getAll } from 'src/utilities/getAll';

import { updateInPaginatedStore } from './base';
import { profileQueries } from './profile';

export const queryKey = 'firewall';

export const useAllFirewallDevicesQuery = (id: number) =>
  useQuery<FirewallDevice[], APIError[]>(
    [queryKey, 'firewall', id, 'devices'],
    () => getAllFirewallDevices(id)
  );

export const useAddFirewallDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<FirewallDevice, APIError[], FirewallDevicePayload>(
    (data) => addFirewallDevice(id, data),
    {
      onSuccess(data) {
        // Refresh the cached device list
        queryClient.invalidateQueries([queryKey, 'firewall', id, 'devices']);

        // Refresh the cached result of the linode-specific firewalls query
        queryClient.invalidateQueries([
          linodesQueryKey,
          'linode',
          data.entity.id,
          'firewalls',
        ]);
      },
    }
  );
};

export const useRemoveFirewallDeviceMutation = (
  firewallId: number,
  deviceId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>(
    () => deleteFirewallDevice(firewallId, deviceId),
    {
      onSuccess() {
        queryClient.setQueryData<FirewallDevice[]>(
          [queryKey, 'firewall', firewallId, 'devices'],
          (oldData) => {
            return oldData?.filter((device) => device.id !== deviceId) ?? [];
          }
        );
      },
    }
  );
};

export const useFirewallsQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getFirewalls(params, filter),
    { keepPreviousData: true }
  );
};

export const useFirewallQuery = (id: number) => {
  return useQuery<Firewall, APIError[]>([queryKey, 'firewall', id], () =>
    getFirewall(id)
  );
};

export const useAllFirewallsQuery = (enabled: boolean = true) => {
  return useQuery<Firewall[], APIError[]>(
    [queryKey, 'all'],
    getAllFirewallsRequest,
    { enabled }
  );
};

export const useMutateFirewall = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Firewall, APIError[], Partial<Firewall>>(
    (data) => updateFirewall(id, data),
    {
      onSuccess(firewall) {
        queryClient.setQueryData([queryKey, 'firewall', id], firewall);
        queryClient.invalidateQueries([queryKey, 'paginated']);
      },
    }
  );
};

export const useCreateFirewall = () => {
  const queryClient = useQueryClient();
  return useMutation<Firewall, APIError[], CreateFirewallPayload>(
    (data) => createFirewall(data),
    {
      onSuccess(firewall) {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData([queryKey, 'firewall', firewall.id], firewall);
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries(profileQueries.profile().grants.queryKey);
      },
    }
  );
};

export const useDeleteFirewall = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteFirewall(id), {
    onSuccess() {
      queryClient.removeQueries([queryKey, 'firewall', id]);
      queryClient.invalidateQueries([queryKey, 'paginated']);
    },
  });
};

export const useUpdateFirewallRulesMutation = (firewallId: number) => {
  const queryClient = useQueryClient();
  return useMutation<FirewallRules, APIError[], FirewallRules>(
    (data) => updateFirewallRules(firewallId, data),
    {
      onSuccess(updatedRules) {
        // Update rules on specific firewall
        queryClient.setQueryData<Firewall | undefined>(
          [queryKey, 'firewall', firewallId],
          (oldData) => {
            if (!oldData) {
              return undefined;
            }
            return { ...oldData, rules: updatedRules };
          }
        );
        // update our paginated store with new rules
        updateInPaginatedStore(
          [queryKey, 'paginated'],
          firewallId,
          {
            id: firewallId,
            rules: updatedRules,
          },
          queryClient
        );
      },
    }
  );
};

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

export const firewallEventsHandler = ({ queryClient }: EventWithStore) => {
  // We will over-fetch a little bit, bit this ensures Cloud firewalls are *always* up to date
  queryClient.invalidateQueries([queryKey]);
};
