import {
  cloneDomain,
  createDomain,
  deleteDomain,
  importZone,
  updateDomain,
} from '@linode/api-v4';
import { profileQueries } from '@linode/queries';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { domainQueries } from './keys';

import type {
  APIError,
  CloneDomainPayload,
  CreateDomainPayload,
  Domain,
  DomainRecord,
  Filter,
  ImportZonePayload,
  Params,
  ResourcePage,
  UpdateDomainPayload,
} from '@linode/api-v4';

export const useDomainsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<Domain>, APIError[]>({
    ...domainQueries.domains._ctx.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useAllDomainsQuery = (enabled: boolean = false) =>
  useQuery<Domain[], APIError[]>({
    ...domainQueries.domains._ctx.all,
    enabled,
  });

export const useDomainsInfiniteQuery = (filter: Filter, enabled: boolean) => {
  return useInfiniteQuery<ResourcePage<Domain>, APIError[]>({
    ...domainQueries.domains._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
};

export const useDomainQuery = (id: number, enabled: boolean = true) =>
  useQuery<Domain, APIError[]>({
    ...domainQueries.domain(id),
    enabled,
  });

export const useDomainRecordsQuery = (id: number) =>
  useQuery<DomainRecord[], APIError[]>(domainQueries.domain(id)._ctx.records);

export const useCreateDomainMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CreateDomainPayload>({
    mutationFn: createDomain,
    onSuccess(domain) {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: domainQueries.domains.queryKey,
      });

      // Set Domain in cache
      queryClient.setQueryData(
        domainQueries.domain(domain.id).queryKey,
        domain,
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useCloneDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CloneDomainPayload>({
    mutationFn: (data) => cloneDomain(id, data),
    onSuccess(domain) {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: domainQueries.domains.queryKey,
      });

      // Set Domain in cache
      queryClient.setQueryData(
        domainQueries.domain(domain.id).queryKey,
        domain,
      );
    },
  });
};

export const useImportZoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], ImportZonePayload>({
    mutationFn: importZone,
    onSuccess(domain) {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: domainQueries.domains.queryKey,
      });

      // Set Domain in cache
      queryClient.setQueryData(
        domainQueries.domain(domain.id).queryKey,
        domain,
      );
    },
  });
};

export const useDeleteDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteDomain(id),
    onSuccess() {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: domainQueries.domains.queryKey,
      });

      // Remove domain (and its sub-queries) from the cache
      queryClient.removeQueries({
        queryKey: domainQueries.domain(id).queryKey,
      });
    },
  });
};

interface UpdateDomainPayloadWithId extends UpdateDomainPayload {
  id: number;
}

export const useUpdateDomainMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], UpdateDomainPayloadWithId>({
    mutationFn: ({ id, ...data }) => updateDomain(id, data),
    onSuccess(domain) {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: domainQueries.domains.queryKey,
      });

      // Update domain in cache
      queryClient.setQueryData<Domain>(
        domainQueries.domain(domain.id).queryKey,
        domain,
      );
    },
  });
};
