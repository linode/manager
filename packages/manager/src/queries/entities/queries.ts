import { Filter, getAccountEntities } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const entitiesQueries = createQueryKeys('entities', {
  entities: {
    queryFn: getAccountEntities,
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam }) =>
      getAccountEntities({ page: pageParam as number, page_size: 500 }, filter),
    queryKey: [filter],
  }),
});
