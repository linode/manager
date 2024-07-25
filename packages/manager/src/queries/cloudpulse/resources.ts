import { useQuery } from '@tanstack/react-query';

import { getAllLinodesRequest } from '../linodes/requests';
import { volumeQueries } from '../volumes/volumes';

import type { Filter, Params } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

// in this we don't need to define our own query factory, we will reuse existing query factory implementation from services like in volumes.ts, linodes.ts etc
export const QueryFactoryByResources = (
  resourceType: string | undefined,
  params?: Params,
  filters?: Filter
) => {
  switch (resourceType) {
    case 'linode':
      return {
        queryFn: () => getAllLinodesRequest(params, filters), // since we don't have query factory implementation, in linodes.ts, once it is ready we will reuse that, untill then we will use same query keys
        queryKey: ['linodes', params, filters],
      };
    case 'volumes':
      return volumeQueries.lists._ctx.all(params, filters); // in this we don't need to define our own query factory, we will reuse existing implementation in volumes.ts
    default:
      return volumeQueries.lists._ctx.all(params, filters); // default to volumes
  }
};

export const useResourcesQuery = (
  enabled = false,
  resourceType: string | undefined,
  params?: Params,
  filters?: Filter
) =>
  useQuery<any[], unknown, CloudPulseResources[]>({
    ...QueryFactoryByResources(resourceType, params, filters),
    enabled,
    select: (resources) => {
      return resources.map((resource) => {
        return {
          id: resource.id,
          label: resource.label,
          region: resource.region,
          regions: resource.regions ? resource.regions : [],
        };
      });
    },
  });
