import {
  createFirewall,
  CreateFirewallPayload,
  deleteFirewall,
  Firewall,
  FirewallRules,
  getFirewalls,
  updateFirewall,
  updateFirewallRules as _updateFirewallRules
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import {
  mutationHandlers,
  listToItemsByID,
  queryPresets,
  creationHandlers,
  deletionHandlers,
  queryClient,
  ItemsByID
} from './base';

const getAllFirewallsRequest = () =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(passedParams, passedFilter)
  )().then(data => listToItemsByID(data.data));

const queryKey = 'queryFirewalls';

export const useFirewallQuery = () => {
  return useQuery<Record<string, Firewall>, APIError[]>(
    queryKey,
    getAllFirewallsRequest,
    queryPresets.longLived
  );
};

type MutateFirewall = { id: number; payload: Partial<Firewall> };

// @TODO: Refactor so these are combined?
export const useMutateFirewall = () => {
  return useMutation<Firewall, APIError[], MutateFirewall>(mutateData => {
    return updateFirewall(mutateData.id, mutateData.payload);
  }, mutationHandlers(queryKey));
};

export const useCreateFirewall = () => {
  return useMutation<Firewall, APIError[], CreateFirewallPayload>(
    createData => {
      return createFirewall(createData);
    },
    creationHandlers(queryKey)
  );
};

export const useDeleteFirewall = () => {
  return useMutation<{}, APIError[], { id: number }>(payload => {
    return deleteFirewall(payload.id);
  }, deletionHandlers(queryKey));
};

export const updateFirewallRules = (id: number, rules: FirewallRules) => {
  return _updateFirewallRules(id, rules).then(updatedRules => {
    queryClient.setQueryData<ItemsByID<Firewall>>(
      queryKey,
      (oldData: ItemsByID<Firewall>) => ({
        ...oldData,
        [id]: { ...oldData[id], rules: updatedRules }
      })
    );
    return updatedRules;
  });
};
