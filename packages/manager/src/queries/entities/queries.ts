import { getAccountEntities } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const entitiesQueries = createQueryKeys('entities', {
  entities: {
    queryFn: getAccountEntities,
    queryKey: null,
  },
});
