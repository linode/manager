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
} from '@linode/api-v4/lib/domains';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from './base';

export const queryKey = 'domains';

export const useDomainsQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<Domain>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getDomains(params, filter),
    { keepPreviousData: true }
  );

export const useDomainQuery = (id: number) =>
  useQuery<Domain, APIError[]>([queryKey, id], () => getDomain(id));

export const useCreateDomainMutation = () =>
  useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: () => {
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useCloneDomainMutation = (id: number) =>
  useMutation<Domain, APIError[], CloneDomainPayload>(
    (data) => cloneDomain(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );

export const useDeleteDomainMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(`${queryKey}-list`);
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
