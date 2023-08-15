import {
  Loadbalancer,
  getLoadbalancer,
  getLoadbalancers,
} from '@linode/api-v4';
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

export const useLoadBalancerQuery = (id: number) => {
  return useQuery<Loadbalancer, APIError[]>([queryKey, 'aglb', id], () =>
    getLoadbalancer(id)
  );
};
