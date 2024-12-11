import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { APIError, Filter, Params } from '@linode/api-v4';
import type { CloudPulseTags } from 'src/features/CloudPulse/shared/CloudPulseTagsFilter';

export const useTagsQuery = (
  enabled = false,
  resourceType: string | undefined,
  params?: Params,
  filters?: Filter
) =>
  useQuery<any[], APIError[], CloudPulseTags[]>({
    ...queryFactory.resources(resourceType, params, filters),
    enabled,
    select: (resources) => {
      const uniqueTags = new Set<string>(
        resources.flatMap((resource) => resource.tags)
      );
      return Array.from(uniqueTags).map((tag) => ({ label: tag }));
    },
  });
