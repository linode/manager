import { useQuery } from '@tanstack/react-query';

import { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

import { getAllLoadbalancers } from '../aclb/requests';
import { getAllLinodesRequest } from '../linodes/requests';
import { getAllVolumes } from '../volumes/requests';

export const useResourcesQuery = (
  key: any,
  enabled: boolean,
  resourceType: string | undefined
) => {
  return useQuery<any[], unknown, CloudPulseResources[]>(
    [key, resourceType],
    ResourcesFactory(resourceType),
    {
      enabled,
      keepPreviousData: true,
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
    }
  );
};

const ResourcesFactory = (resourceType: string | undefined) => {
  switch (resourceType) {
    case 'linode':
      return () => getAllLinodesRequest();
    case 'volumes':
      return () => getAllVolumes();
    case 'aclb':
      return () => getAllLoadbalancers();
    default:
      return () => {
        return [];
      }; // default to empty array
  }
};
