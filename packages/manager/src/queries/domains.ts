import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { doesItemExistInPaginatedStore } from './base';
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
import { EntityEventWithStore } from 'src/events';

export const queryKey = 'domains';

export const useDomainsQuery = (params: Params, filter: Filter) =>
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

export const useCreateDomainMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CreateDomainPayload>(createDomain, {
    onSuccess: (domain) => {
      invalidatePaginatedStore(queryClient);
      queryClient.setQueryData([queryKey, domain.id], domain);
    },
  });
};

export const useCloneDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Domain, APIError[], CloneDomainPayload>(
    (data) => cloneDomain(id, data),
    {
      onSuccess: (domain) => {
        invalidatePaginatedStore(queryClient);
        queryClient.setQueryData([queryKey, domain.id], domain);
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
        invalidatePaginatedStore(queryClient);
        queryClient.setQueryData([queryKey, domain.id], domain);
      },
    }
  );
};

export const useDeleteDomainMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteDomain(id), {
    onSuccess: () => {
      invalidatePaginatedStore(queryClient);
      queryClient.removeQueries([queryKey, id], { exact: true });
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
      onSuccess: (data, vars) => {
        updatePaginatedDomainsStore(vars.id, data, queryClient);
        queryClient.setQueryData<Domain>([queryKey, data.id], data);
      },
    }
  );
};

// @TODO: make this generic
const updatePaginatedDomainsStore = (
  id: number,
  newData: Partial<Domain>,
  queryClient: QueryClient
) => {
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
const doesDomainExistInStore = (id: number, queryClient: QueryClient) => {
  const data = queryClient.getQueryData<Domain | undefined>([queryKey, id]);

  return data !== undefined;
};

const invalidatePaginatedStore = (queryClient: QueryClient) => {
  queryClient.invalidateQueries(`${queryKey}-list`);
};

export const domainEventsHandler = (event: EntityEventWithStore) => {
  const {
    event: { action, entity },
    queryClient,
  } = event;
  const { id } = entity;

  if (
    action === 'domain_create' &&
    !doesItemExistInPaginatedStore(`${queryKey}-list`, id, queryClient)
  ) {
    invalidatePaginatedStore(queryClient);
  }

  if (action === 'domain_delete') {
    if (doesItemExistInPaginatedStore(`${queryKey}-list`, id, queryClient)) {
      invalidatePaginatedStore(queryClient);
    }
    if (doesDomainExistInStore(id, queryClient)) {
      queryClient.removeQueries([queryKey, id], { exact: true });
    }
  }
};

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);
