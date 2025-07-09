import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllMaintenance, getIncidents } from './requests';

export const statusPageQueries = createQueryKeys('statusPage', {
  incidents: (statusPageUrl?: string) => ({
    queryKey: [statusPageUrl],
    queryFn: () => getIncidents(statusPageUrl),
  }),
  maintenance: (statusPageUrl?: string) => ({
    queryKey: [statusPageUrl],
    queryFn: () => getAllMaintenance(statusPageUrl),
  }),
});
