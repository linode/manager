import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Params } from '@linode/api-v4';
import type {
  CloudPulseResources,
  ExtendedFilter,
} from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

export const useResourcesQuery = (
  enabled = false,
  resourceType: string | undefined,
  params?: Params,
  filters?: ExtendedFilter
) =>
  useQuery<any[], unknown, CloudPulseResources[]>({
    ...queryFactory.resources(resourceType, params, filters),
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
