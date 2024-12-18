import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { getAllMaintenance, getIncidents } from './requests';

import type { IncidentResponse, MaintenanceResponse } from './types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryOptions } from '@tanstack/react-query';

const statusPageQueries = createQueryKeys('statusPage', {
  incidents: {
    queryFn: getIncidents,
    queryKey: null,
  },
  maintenance: {
    queryFn: getAllMaintenance,
    queryKey: null,
  },
});

const useIncidentQuery = () =>
  useQuery<IncidentResponse, APIError[]>({
    ...statusPageQueries.incidents,
    ...queryPresets.shortLived,
  });

const useMaintenanceQuery = (
  options?: Partial<UseQueryOptions<MaintenanceResponse, APIError[]>>
) =>
  useQuery<MaintenanceResponse, APIError[]>({
    ...statusPageQueries.maintenance,
    ...queryPresets.shortLived,
    ...(options ?? {}),
  });
