import { queryPresets } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { statusPageQueries } from './keys';

import type { IncidentResponse, MaintenanceResponse } from './types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export const useIncidentQuery = () =>
  useQuery<IncidentResponse, APIError[]>({
    ...statusPageQueries.incidents,
    ...queryPresets.shortLived,
  });

export const useMaintenanceQuery = (
  options?: Partial<UseQueryOptions<MaintenanceResponse, APIError[]>>,
) =>
  useQuery<MaintenanceResponse, APIError[]>({
    ...statusPageQueries.maintenance,
    ...queryPresets.shortLived,
    ...(options ?? {}),
  });
