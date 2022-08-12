import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
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

export const useDomainsQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<Domain>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getDomains(params, filter),
    { keepPreviousData: true }
  );

export const useAllDomainsQuery = (enabled: boolean = false) =>
  useQuery<Domain[], APIError[]>(`${queryKey}-all-list`, getAllDomains, {
    enabled,
  });

export const useDomainQuery = (id: number) =>
  useQuery<Domain, APIError[]>([queryKey, id], () => getDomain(id));

export const useCreateDomainMutation = () =>
  useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: (domain) => {
      invalidatePaginatedStore();
      queryClient.setQueryData([queryKey, domain.id], domain);
    },
  });

export const useCloneDomainMutation = (id: number) =>
  useMutation<Domain, APIError[], CloneDomainPayload>(
    (data) => cloneDomain(id, data),
    {
      onSuccess: (domain) => {
        invalidatePaginatedStore();
        queryClient.setQueryData([queryKey, domain.id], domain);
      },
    }
  );

export const useImportZoneMutation = () =>
  useMutation<Domain, APIError[], ImportZonePayload>(
    (data) => importZone(data),
    {
      onSuccess: (domain) => {
        invalidatePaginatedStore();
        queryClient.setQueryData([queryKey, domain.id], domain);
      },
    }
  );

export const useDeleteDomainMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      invalidatePaginatedStore();
      queryClient.removeQueries([queryKey, id], { exact: true });
    },
  });

export const useUpdateDomainMutation = () =>
  useMutation<Domain, APIError[], { id: number } & UpdateDomainPayload>(
    (data) => {
      const { id, ...rest } = data;
      return updateDomain(id, rest);
    },
    {
      onSuccess: (data, vars) => {
        updatePaginatedDomainsStore(vars.id, data);
        queryClient.setQueryData<Domain>([queryKey, data.id], data);
      },
    }
  );

// @TODO: make this generic
const updatePaginatedDomainsStore = (id: number, newData: Partial<Domain>) => {
  queryClient.setQueriesData<ResourcePage<Domain> | undefined>(
    `${queryKey}-list`,
    (oldData) => {
      if (oldData === undefined) {
        return undefined;
      }

      const domainToUpdateIndex = oldData.data.findIndex(
        (domain) => domain.id === id
      );

      const isDomainOnPage = domainToUpdateIndex !== -1;

      if (!isDomainOnPage) {
        return oldData;
      }

      oldData.data[domainToUpdateIndex] = {
        ...oldData.data[domainToUpdateIndex],
        ...newData,
      };

      return oldData;
    }
  );
};

// @TODO: make this generic
const doesDomainExistInPaginatedStore = (id: number) => {
  const stores = queryClient.getQueriesData<ResourcePage<Domain> | undefined>(
    `${queryKey}-list`
  );

  for (const store of stores) {
    const data = store[1]?.data;
    if (data?.some((domain) => domain.id === id)) {
      return true;
    }
  }

  return false;
};

// @TODO: make this generic
const doesDomainExistInStore = (id: number) => {
  const data = queryClient.getQueryData<Domain | undefined>([queryKey, id]);

  return data !== undefined;
};

const invalidatePaginatedStore = () => {
  queryClient.invalidateQueries(`${queryKey}-list`);
};

export const domainEventsHandler = (event: EntityEvent) => {
  const { action, entity } = event;
  const { id } = entity;

  if (action === 'domain_create' && !doesDomainExistInPaginatedStore(id)) {
    invalidatePaginatedStore();
  }

  if (action === 'domain_delete') {
    if (doesDomainExistInPaginatedStore(id)) {
      invalidatePaginatedStore();
    }
    if (doesDomainExistInStore(id)) {
      queryClient.removeQueries([queryKey, id], { exact: true });
    }
  }
};

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);
