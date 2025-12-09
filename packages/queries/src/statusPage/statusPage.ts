import { queryPresets } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { statusPageQueries } from './keys';

import type { IncidentResponse, MaintenanceResponse } from './types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export const useIncidentQuery = (
  statusPageUrl?: string,
  options?: Partial<UseQueryOptions<IncidentResponse, APIError[]>>,
) =>
  useQuery<IncidentResponse, APIError[]>({
    ...statusPageQueries.incidents(statusPageUrl),
    ...queryPresets.shortLived,
    ...(options ?? {}),
  });

export const useMaintenanceQuery = (
  statusPageUrl?: string,
  options?: Partial<UseQueryOptions<MaintenanceResponse, APIError[]>>,
) =>
  useQuery<MaintenanceResponse, APIError[]>({
    ...statusPageQueries.maintenance(statusPageUrl),
    ...queryPresets.shortLived,
    ...(options ?? {}),
  });
