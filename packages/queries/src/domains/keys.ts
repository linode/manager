import { getDomain, getDomains } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllDomainRecords, getAllDomains } from './domains';

import type { Filter, Params } from '@linode/api-v4';

export const domainQueries = createQueryKeys('domains', {
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
      infinite: (filter: Filter) => ({
        queryFn: ({ pageParam }) =>
          getDomains({ page: pageParam as number }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getDomains(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});
