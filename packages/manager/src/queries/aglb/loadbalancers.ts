import { Loadbalancer, getLoadbalancers } from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

export const queryKey = 'loadbalancer';

export const useLoadBalancers = () => {
  return useQuery<ResourcePage<Loadbalancer>, APIError[]>(
    [queryKey, 'paginated'],
    () => getLoadbalancers(),
    { keepPreviousData: true }
  );
};
