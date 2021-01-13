import {
  createFirewall,
  CreateFirewallPayload,
  deleteFirewall,
  Firewall,
  getFirewalls,
  updateFirewall
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import {
  mutationHandlers,
  listToItemsByID,
  queryPresets,
  HasID,
  creationHandlers,
  deletionHandlers
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
  return useMutation<{}, APIError[], HasID>(payload => {
    return deleteFirewall(payload.id);
  }, deletionHandlers(queryKey));
};
