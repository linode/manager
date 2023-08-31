import {
  createLoadbalancerCertificate,
  getLoadbalancerCertificates,
} from '@linode/api-v4';
import { useQuery, useQueryClient, useMutation } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Certificate,
  CreateCertificatePayload,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useLoadBalancerCertificatesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Certificate>, APIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'certificates', params, filter],
    () => getLoadbalancerCertificates(id, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerCertificateCreateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Certificate, APIError[], CreateCertificatePayload>(
    (data) => createLoadbalancerCertificate(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          id,
          'certificates',
        ]);
      },
    }
  );
};
