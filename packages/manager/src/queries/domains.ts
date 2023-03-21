import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from './base';
import { EntityEvent } from '@linode/api-v4';
import {
  cloneDomain,
  createDomain,
  CreateDomainPayload,
  deleteDomain,
  Domain,
  getDomains,
  updateDomain,
  UpdateDomainPayload,
  CloneDomainPayload,
  getDomain,
  ImportZonePayload,
  importZone,
} from '@linode/api-v4/lib/domains';
import { getAll } from 'src/utilities/getAll';

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

export const useCreateDomainMutation = () =>
  useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: (domain) => {
      queryClient.invalidateQueries([queryKey]);
      queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
    },
  });

export const useCloneDomainMutation = (id: number) =>
  useMutation<Domain, APIError[], CloneDomainPayload>(
    (data) => cloneDomain(id, data),
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
      },
    }
  );

export const useImportZoneMutation = () =>
  useMutation<Domain, APIError[], ImportZonePayload>(
    (data) => importZone(data),
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData([queryKey, 'domain', domain.id], domain);
      },
    }
  );

export const useDeleteDomainMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      queryClient.removeQueries([queryKey, 'domain', id]);
    },
  });

export const useUpdateDomainMutation = () =>
  useMutation<Domain, APIError[], { id: number } & UpdateDomainPayload>(
    (data) => {
      const { id, ...rest } = data;
      return updateDomain(id, rest);
    },
    {
      onSuccess: (domain) => {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData<Domain>(
          [queryKey, 'domain', domain.id],
          domain
        );
      },
    }
  );

export const domainEventsHandler = (event: EntityEvent) => {
  const { status } = event;

  if (['notification', 'failed', 'finished'].includes(status)) {
    queryClient.invalidateQueries([queryKey]);
  }
};

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);
