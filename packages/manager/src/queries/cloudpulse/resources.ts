import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Filter, FirewallDeviceEntity, Params } from '@linode/api-v4';
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
        const entities: Record<string, string> = {};

        // handle separately for firewall resource type
        if (resourceType === 'firewall') {
          resource.entities?.forEach((entity: FirewallDeviceEntity) => {
            if (entity.type === 'linode' && entity.label) {
              entities[String(entity.id)] = entity.label;
            } else if (
              entity.type === 'linode_interface' &&
              entity.parent_entity
            ) {
              const { id, label } = entity.parent_entity;
              if (label) {
                entities[String(id)] = label;
              }
            }
          });
        }
        return {
          engineType: resource.engine,
          id: String(resource.id),
          label: resource.label,
          region: resource.region,
          regions: resource.regions ? resource.regions : [],
          tags: resource.tags,
          entities,
          clusterSize: resource.cluster_size,
        };
      });
    },
  });
