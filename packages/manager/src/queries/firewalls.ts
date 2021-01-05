import {
  Firewall,
  getFirewalls,
  updateFirewall
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { mutationHandlers, listToItemsByID, queryPresets } from './base';

const getFirewallsRequest = (passedParams: any = {}, passedFilter: any = {}) =>
  getFirewalls(passedParams, passedFilter).then(data => ({
    data: listToItemsByID(data.data),
    results: data.results
  }));

const queryKey = 'firewall';

interface FirewallData {
  results: number;
  data: Record<string, Firewall>;
}

export const useFirewallQuery = (params: any = {}, filter: any = {}) => {
  return useQuery<FirewallData, APIError[]>(
    [queryKey, params, filter],
    () => getFirewallsRequest(params, filter),
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
