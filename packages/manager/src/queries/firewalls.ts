import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import {
  addFirewallDevice,
  createFirewall,
  CreateFirewallPayload,
  deleteFirewall,
  deleteFirewallDevice,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
  getFirewall,
  getFirewallDevices,
  getFirewalls,
  updateFirewall,
  updateFirewallRules,
} from '@linode/api-v4/lib/firewalls';
import {
  queryClient,
  itemInListCreationHandler,
  updateInPaginatedStore,
} from './base';

export const queryKey = 'firewall';

export const useAllFirewallDevicesQuery = (id: number) =>
  useQuery<FirewallDevice[], APIError[]>([queryKey, id, 'devices'], () =>
    getAllFirewallDevices(id)
  );

export const useAddFirewallDeviceMutation = (id: number) =>
  useMutation<FirewallDevice, APIError[], FirewallDevicePayload>(
    (data) => addFirewallDevice(id, data),
    itemInListCreationHandler([queryKey, id, 'devices'])
  );

export const useRemoveFirewallDeviceMutation = (
  firewallId: number,
  deviceId: number
) =>
  useMutation<{}, APIError[]>(
    () => deleteFirewallDevice(firewallId, deviceId),
    {
      onSuccess() {
        queryClient.setQueryData<FirewallDevice[]>(
          [queryKey, firewallId, 'devices'],
          (oldData) => {
            return oldData?.filter((device) => device.id !== deviceId) ?? [];
          }
        );
      },
    }
  );

export const useFirewallsQuery = (params?: any, filter?: any) => {
  return useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getFirewalls(params, filter),
    { keepPreviousData: true }
  );
};

export const useFirewallQuery = (id: number) => {
  return useQuery<Firewall, APIError[]>([queryKey, id], () => getFirewall(id));
};

export const useAllFirewallsQuery = (enabled: boolean = true) => {
  return useQuery<Firewall[], APIError[]>(
    `${queryKey}-all`,
    getAllFirewallsRequest,
    { enabled }
  );
};

export const useMutateFirewall = (id: number) => {
  return useMutation<Firewall, APIError[], Partial<Firewall>>(
    (data) => updateFirewall(id, data),
    {
      onSuccess(firewall) {
        queryClient.setQueryData([queryKey, id], firewall);
        updateInPaginatedStore([queryKey, 'paginated'], id, firewall);
      },
    }
  );
};

export const useCreateFirewall = () => {
  return useMutation<Firewall, APIError[], CreateFirewallPayload>(
    (data) => createFirewall(data),
    {
      onSuccess(firewall) {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData([queryKey, firewall.id], firewall);
      },
    }
  );
};

export const useDeleteFirewall = (id: number) => {
  return useMutation<{}, APIError[]>(() => deleteFirewall(id), {
    onSuccess() {
      queryClient.removeQueries([queryKey, id]);
      queryClient.invalidateQueries([queryKey, 'paginated']);
    },
  });
};

export const useUpdateFirewallRulesMutation = (firewallId: number) => {
  return useMutation<FirewallRules, APIError[], FirewallRules>(
    (data) => updateFirewallRules(firewallId, data),
    {
      onSuccess(updatedRules) {
        // Update rules on specific firewall
        queryClient.setQueryData<Firewall | undefined>(
          [queryKey, firewallId],
          (oldData) => {
            if (!oldData) {
              return undefined;
            }
            return { ...oldData, rules: updatedRules };
          }
        );
        // update our paginated store with new rules
        updateInPaginatedStore([queryKey, 'paginated'], firewallId, {
          id: firewallId,
          rules: updatedRules,
        });
      },
    }
  );
};

const getAllFirewallDevices = (
  id: number,
  passedParams: any = {},
  passedFilter: any = {}
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
