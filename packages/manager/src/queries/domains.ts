import {
  CloneDomainPayload,
  CreateDomainPayload,
  Domain,
  DomainRecord,
  ImportZonePayload,
  UpdateDomainPayload,
  cloneDomain,
  createDomain,
  deleteDomain,
  getDomain,
  getDomainRecords,
  getDomains,
  importZone,
  updateDomain,
} from '@linode/api-v4/lib/domains';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventWithStore } from 'src/events';
import { getAll } from 'src/utilities/getAll';
import { profileQueries } from './profile';

export const queryKey = 'domains';

export const useDomainsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<Domain>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getDomains(params, filter),
    { keepPreviousData: true }
  );

export const useAllDomainsQuery = (enabled: boolean = false) =>
  useQuery<Domain[], APIError[]>([queryKey, 'all'], getAllDomains, {
    enabled,
  });

export const useDomainQuery = (id: number) =>
  useQuery<Domain, APIError[]>([queryKey, 'domain', id], () => getDomain(id));

export const useDomainRecordsQuery = (id: number) =>
  useQuery<DomainRecord[], APIError[]>(
    [queryKey, 'domain', id, 'records'],
    () => getAllDomainRecords(id)
  );

export const useCreateDomainMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: (domain) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useCloneDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CloneDomainPayload>(
    (data) => cloneDomain(id, data),
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
      },
    }
  );
};

export const useImportZoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], ImportZonePayload>(
    (data) => importZone(data),
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
      },
    }
  );
};

export const useDeleteDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.removeQueries([queryKey, 'domain', id]);
    },
  });
};

export const useUpdateDomainMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], { id: number } & UpdateDomainPayload>(
    (data) => {
      const { id, ...rest } = data;
      return updateDomain(id, rest);
    },
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData<Domain>(
          [queryKey, 'domain', domain.id],
          domain
        );
      },
    }
  );
};

export const domainEventsHandler = ({ queryClient }: EventWithStore) => {
  // Invalidation is agressive beacuse it will invalidate on every domain event, but
  // it is worth it for the UX benefits. We can fine tune this later if we need to.
  queryClient.invalidateQueries([queryKey]);
};

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);

const getAllDomainRecords = (domainId: number) =>
  getAll<DomainRecord>((params) => getDomainRecords(domainId, params))().then(
    ({ data }) => data
  );
