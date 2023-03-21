import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
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
  getFirewallDevices,
  getFirewalls,
  updateFirewall,
  updateFirewallRules as _updateFirewallRules,
} from '@linode/api-v4/lib/firewalls';
import {
  mutationHandlers,
  listToItemsByID,
  queryPresets,
  creationHandlers,
  deletionHandlers,
  queryClient,
  ItemsByID,
  itemInListCreationHandler,
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
  )().then((data) => listToItemsByID(data.data));

const getAllPlainFirewallsRequest = () =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(passedParams, passedFilter)
  )().then((data) => data.data);

export const useFirewallQuery = () => {
  return useQuery<Record<string, Firewall>, APIError[]>(
    queryKey,
    getAllFirewallsRequest,
    queryPresets.longLived
  );
};

export const useAllFirewallsQuery = (enabled: boolean = true) => {
  return useQuery<Firewall[], APIError[]>(
    `${queryKey}-all`,
    getAllPlainFirewallsRequest,
    { enabled }
  );
};

type MutateFirewall = { id: number; payload: Partial<Firewall> };

export const useMutateFirewall = () => {
  return useMutation<Firewall, APIError[], MutateFirewall>((mutateData) => {
    return updateFirewall(mutateData.id, mutateData.payload);
  }, mutationHandlers(queryKey));
};

export const useCreateFirewall = () => {
  return useMutation<Firewall, APIError[], CreateFirewallPayload>(
    (createData) => {
      return createFirewall(createData);
    },
    creationHandlers(queryKey)
  );
};

export const useDeleteFirewall = () => {
  return useMutation<{}, APIError[], { id: number }>((payload) => {
    return deleteFirewall(payload.id);
  }, deletionHandlers(queryKey));
};

export const updateFirewallRules = (id: number, rules: FirewallRules) => {
  return _updateFirewallRules(id, rules).then((updatedRules) => {
    queryClient.setQueryData<ItemsByID<Firewall>>(
      queryKey,
      (oldData: ItemsByID<Firewall>) => ({
        ...oldData,
        [id]: { ...oldData[id], rules: updatedRules },
      })
    );
    return updatedRules;
  });
};
