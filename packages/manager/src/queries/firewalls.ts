import {
  Firewall,
  getFirewalls,
  updateFirewall
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { mutationHandlers, listToItemsByID, queryPresets } from './base';

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

export const useMutateFirewall = (id: number) => {
  return useMutation<Firewall, APIError[], Partial<Firewall>>(
    (payload: Partial<Firewall>) => {
      return updateFirewall(id, payload);
    },
    mutationHandlers(queryKey, id)
  );
};
