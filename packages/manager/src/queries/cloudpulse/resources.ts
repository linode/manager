import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Filter, Params } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

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
