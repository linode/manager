import {
  createLoadbalancerCertificate,
  deleteLoadbalancerCertificate,
  updateLoadbalancerCertificate,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { aclbQueries } from './queries';

import type {
  APIError,
  Certificate,
  CreateCertificatePayload,
  Filter,
  Params,
  ResourcePage,
  UpdateCertificatePayload,
} from '@linode/api-v4';

export const useLoadBalancerCertificatesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Certificate>, APIError[]>({
    ...aclbQueries
      .loadbalancer(id)
      ._ctx.certificates._ctx.lists._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useLoadbalancerCertificateQuery = (
  loadbalancerId: number,
  certificateId: number,
  enabled = true
) => {
  return useQuery<Certificate, APIError[]>({
    ...aclbQueries
      .loadbalancer(loadbalancerId)
      ._ctx.certificates._ctx.certificate(certificateId),
    enabled,
  });
};

export const useLoadBalancerCertificateCreateMutation = (
  loadbalancerId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Certificate, APIError[], CreateCertificatePayload>({
    mutationFn: (data) => createLoadbalancerCertificate(loadbalancerId, data),
    onSuccess(certificate) {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.certificates
          ._ctx.lists.queryKey,
      });

      queryClient.setQueryData(
        aclbQueries
          .loadbalancer(loadbalancerId)
          ._ctx.certificates._ctx.certificate(certificate.id).queryKey,
        certificate
      );
    },
  });
};

export const useLoadBalancerCertificateMutation = (
  loadbalancerId: number,
  certificateId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Certificate, APIError[], UpdateCertificatePayload>({
    mutationFn: (data) =>
      updateLoadbalancerCertificate(loadbalancerId, certificateId, data),
    onSuccess(certificate) {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.certificates
          ._ctx.lists.queryKey,
      });

      queryClient.setQueryData(
        aclbQueries
          .loadbalancer(loadbalancerId)
          ._ctx.certificates._ctx.certificate(certificate.id).queryKey,
        certificate
      );
    },
  });
};

export const useLoadBalancerCertificateDeleteMutation = (
  loadbalancerId: number,
  certificateId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () =>
      deleteLoadbalancerCertificate(loadbalancerId, certificateId),
    onSuccess() {
      queryClient.removeQueries({
        queryKey: aclbQueries
          .loadbalancer(loadbalancerId)
          ._ctx.certificates._ctx.certificate(certificateId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.certificates
          ._ctx.lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerCertificatesInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<Certificate>, APIError[]>({
    ...aclbQueries
      .loadbalancer(id)
      ._ctx.certificates._ctx.lists._ctx.infinite(filter),
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });
};
