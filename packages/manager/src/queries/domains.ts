import {
  cloneDomain,
  createDomain,
  deleteDomain,
  getDomain,
  getDomainRecords,
  getDomains,
  importZone,
  updateDomain,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { profileQueries } from './profile/profile';

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
import type { EventHandlerData } from 'src/hooks/useEventHandlers';

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);

const getAllDomainRecords = (domainId: number) =>
  getAll<DomainRecord>((params) => getDomainRecords(domainId, params))().then(
    ({ data }) => data
  );

const domainQueries = createQueryKeys('domains', {
  domain: (id: number) => ({
    contextQueries: {
      records: {
        queryFn: () => getAllDomainRecords(id),
        queryKey: null,
      },
    },
    queryFn: () => getDomain(id),
    queryKey: [id],
  }),
  domains: {
    contextQueries: {
      all: {
        queryFn: getAllDomains,
        queryKey: null,
      },
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getDomains(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useDomainsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<Domain>, APIError[]>({
    ...domainQueries.domains._ctx.paginated(params, filter),
    keepPreviousData: true,
  });

export const useAllDomainsQuery = (enabled: boolean = false) =>
  useQuery<Domain[], APIError[]>({
    ...domainQueries.domains._ctx.all,
    enabled,
  });

export const useDomainQuery = (id: number) =>
  useQuery<Domain, APIError[]>(domainQueries.domain(id));

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
        domain
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
        domain
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
        domain
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
        domain
      );
    },
  });
};

export const domainEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  const domainId = event.entity?.id;

  if (!domainId) {
    return;
  }

  if (event.action.startsWith('domain_record')) {
    // Invalidate the domain's records because they may have changed
    queryClient.invalidateQueries({
      queryKey: domainQueries.domain(domainId)._ctx.records.queryKey,
    });
  } else {
    // Invalidate paginated lists
    queryClient.invalidateQueries({
      queryKey: domainQueries.domains.queryKey,
    });

    // Invalidate the domain's details
    queryClient.invalidateQueries({
      exact: true,
      queryKey: domainQueries.domain(domainId).queryKey,
    });
  }
};
