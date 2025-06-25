import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Filter, Params } from '@linode/api-v4';

interface CloudPulseResources {
  id: string;
  label: string;
  region?: string;
  tags?: string[];
}

export const useResourcesQuery = (
  enabled = false,
  resourceType: string | undefined,
  params?: Params,
  filters?: Filter
) =>
  useQuery<any[], unknown, CloudPulseResources[]>({
    ...queryFactory.resources(resourceType, params, filters),
    enabled,
    select: (resources) => {
      return resources.map((resource) => {
        return {
          engineType: resource.engine,
          id: String(resource.id),
          label: resource.label,
          region: resource.region,
          regions: resource.regions ? resource.regions : [],
          tags: resource.tags,
        };
      });
    },
  });
