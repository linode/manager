import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllMaintenance, getIncidents } from './requests';

export const statusPageQueries = createQueryKeys('statusPage', {
  incidents: {
    queryFn: getIncidents,
    queryKey: null,
  },
  maintenance: {
    queryFn: getAllMaintenance,
    queryKey: null,
  },
});
