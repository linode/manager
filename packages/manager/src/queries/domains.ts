import {
  createDomain,
  CreateDomainPayload,
  deleteDomain,
  Domain,
  getDomains,
  updateDomain,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from './base';
import { EntityEvent } from '@linode/api-v4';

export const queryKey = 'domains';

export const useDomainsQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<Domain>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getDomains(params, filter),
    { keepPreviousData: true }
  );

export const useCreateDomainMutation = () =>
  useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: () => {
      invalidatePaginatedStore();
    },
  });

export const useDeleteDomainMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      invalidatePaginatedStore();
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
