import { getAccountResources } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const resourcesQueries = createQueryKeys('resources', {
  resources: {
    queryFn: getAccountResources,
    queryKey: null,
  },
});
