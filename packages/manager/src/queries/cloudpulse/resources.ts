import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Filter, FirewallDeviceEntity, Params } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

export const useResourcesQuery = (
  enabled = false,
  resourceType: string | undefined,
  params?: Params,
  filters?: Filter,
  firewallEntityType: 'both' | 'linode' | 'nodebalancer' = 'both'
) =>
  useQuery<any[], unknown, CloudPulseResources[]>({
    ...queryFactory.resources(resourceType, params, filters),
    enabled,
    retry: resourceType === 'objectstorage' ? false : 3,
    select: (resources) => {
      if (!enabled) {
        return []; // Return empty array if the query is not enabled
      }
      return resources.map((resource) => {
        const entities: Record<string, string> = {};

        // handle separately for firewall resource type
        if (resourceType === 'firewall') {
          resource.entities?.forEach((entity: FirewallDeviceEntity) => {
            if (
              (entity.type === firewallEntityType ||
                firewallEntityType === 'both') &&
              entity.label
            ) {
              entities[String(entity.id)] = entity.label;
            }
            if (
              (firewallEntityType === 'linode' ||
                firewallEntityType === 'both') &&
              entity.type === 'linode_interface' &&
              entity.parent_entity?.label
            ) {
              entities[String(entity.parent_entity.id)] =
                entity.parent_entity.label;
            }
          });
        }
        const id =
          resourceType === 'objectstorage'
            ? resource.hostname
            : String(resource.id);
        return {
          engineType: resource.engine,
          id,
          label: resourceType === 'objectstorage' ? id : resource.label,
          region: resource.region,
          regions: resource.regions ? resource.regions : [],
          tags: resource.tags,
          endpoint: resource.s3_endpoint,
          entities,
          clusterSize: resource.cluster_size,
        };
      });
    },
  });
