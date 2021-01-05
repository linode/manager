import {
  Firewall,
  getFirewalls,
  updateFirewall
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { mutationHandlers, listToItemsByID, queryPresets } from './base';

const getFirewallsRequest = (passedParams: any = {}, passedFilter: any = {}) =>
  getFirewalls(passedParams, passedFilter).then(data =>
    listToItemsByID(data.data)
  );

const queryKey = 'firewall';

export const useFirewallQuery = (params: any = {}, filter: any = {}) => {
  return useQuery<Record<string, Firewall>, APIError[]>(
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
