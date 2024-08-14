import { getLinodes } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { queryFactory } from './queries';

import type {
  APIError,
  Filter,
  Linode,
  Params,
  ResourcePage,
} from '@linode/api-v4';
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
          id: resource.id,
          label: resource.label,
          region: resource.region,
          regions: resource.regions ? resource.regions : [],
        };
      });
    },
  });

const QUERY_KEY = 'cloudpulse-resources';
export const useLinodeResourcesQuery = (
  runQuery: boolean,
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<ResourcePage<Linode>, APIError[]>(
    [QUERY_KEY, 'paginated', params, filter],
    () => getLinodes(params, filter),
    { ...queryPresets.longLived, enabled: runQuery, keepPreviousData: true }
  );
};
