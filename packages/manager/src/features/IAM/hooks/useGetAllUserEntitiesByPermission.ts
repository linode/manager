import {
  useAllFirewallsQuery,
  useAllImagesQuery,
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVolumesQuery,
  useAllVPCsQuery,
  useGetAllUserEntitiesByPermissionQuery,
  useGrants,
} from '@linode/queries';

import { entityPermissionMapFrom } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';
import {
  BETA_ACCESS_TYPE_SCOPE,
  LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE,
} from './usePermissions';

import type {
  APIError,
  EntityType,
  Filter,
  Firewall,
  GrantType,
  Image,
  Linode,
  NodeBalancer,
  Params,
  PermissionType,
  Volume,
  VPC,
} from '@linode/api-v4';
import type { UseQueryResult } from '@linode/queries';

type FullEntityType = Firewall | Image | Linode | NodeBalancer | Volume | VPC;

interface UseGetEntitiesByPermissionProps {
  enabled?: boolean;
  entityType: EntityType;
  filter?: Filter;
  params?: Params;
  permission: PermissionType;
}

type EntityQueryResult<T extends FullEntityType> = UseQueryResult<
  T[] | undefined,
  APIError[]
> & { filter: Filter };

/**
 * Helper to call the right query hook based on entity type
 * Doing this here allows the consumer to not have to worry about the different query hooks for each entity type
 */
const useEntityQuery = <T extends FullEntityType>(
  entityType: EntityType,
  filter: Filter,
  params: Params,
  enabled: boolean
): EntityQueryResult<T> => {
  const linodeQuery = useAllLinodesQuery(
    params,
    filter,
    entityType === 'linode' && enabled
  );
  const firewallQuery = useAllFirewallsQuery(
    entityType === 'firewall' && enabled,
    params,
    filter
  );
  const volumeQuery = useAllVolumesQuery(
    params,
    filter,
    entityType === 'volume' && enabled
  );
  const nodeBalancerQuery = useAllNodeBalancersQuery(
    entityType === 'nodebalancer' && enabled,
    params,
    filter
  );
  const imageQuery = useAllImagesQuery(
    params,
    filter,
    entityType === 'image' && enabled
  );
  const vpcQuery = useAllVPCsQuery({
    enabled: entityType === 'vpc' && enabled,
    filter,
  });

  /**
   * Return the appropriate query result based on entity type
   */
  switch (entityType) {
    case 'firewall':
      return firewallQuery as EntityQueryResult<T>;
    case 'image':
      return imageQuery as EntityQueryResult<T>;
    case 'linode':
      return linodeQuery as EntityQueryResult<T>;
    case 'nodebalancer':
      return nodeBalancerQuery as EntityQueryResult<T>;
    case 'volume':
      return volumeQuery as EntityQueryResult<T>;
    case 'vpc':
      return vpcQuery as EntityQueryResult<T>;
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
};

export const useGetAllUserEntitiesByPermission = <T extends FullEntityType>({
  entityType,
  permission,
  enabled = true,
  filter = {},
  params = {},
}: UseGetEntitiesByPermissionProps) => {
  const { isIAMBeta, isIAMEnabled, profile } = useIsIAMEnabled();

  // Get entities by permission (Restricted IAM users only)
  const {
    data: entitiesByPermission,
    isLoading: isEntitiesByPermissionLoading,
    error: isEntitiesByPermissionError,
  } = useGetAllUserEntitiesByPermissionQuery({
    username: profile?.username,
    entityType,
    permission,
    enabled: enabled && isIAMEnabled,
  });

  /**
   * Determine if we should use IAM permissions or legacy permissions
   */
  const useBetaPermissions =
    isIAMEnabled &&
    isIAMBeta &&
    BETA_ACCESS_TYPE_SCOPE.includes(entityType) &&
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some((blacklistedPermission) =>
      permission.includes(blacklistedPermission)
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUseIAMPermissions = useBetaPermissions || useLAPermissions;

  /**
   * Build API filter when fetching full entities
   */
  const entityIds =
    shouldUseIAMPermissions && profile?.restricted
      ? entitiesByPermission?.map((e) => e.id)
      : undefined;

  /**
   *  Call entity query
   */
  const entityQuery = useEntityQuery<T>(entityType, filter, params, enabled);

  /**
   * Legacy grants for non-IAM users
   */
  const { data: grants, isLoading: grantsLoading } = useGrants(
    !shouldUseIAMPermissions && profile?.restricted && enabled
  );

  /**
   * Return IAM path
   *
   * In case a filter was used, we also return it to be used for client-side filtering
   * ex: we also pass this filter to the LinodeSelect to avoid caching two different queries (with and without filter)
   */
  if (shouldUseIAMPermissions) {
    return {
      ...entityQuery,
      filter,
      data: profile?.restricted
        ? entityQuery.data?.filter((entity) => entityIds?.includes(entity.id))
        : entityQuery.data,
      isLoading: isEntitiesByPermissionLoading || entityQuery.isLoading,
      error: isEntitiesByPermissionError || entityQuery.error,
    };
  }

  /**
   * Legacy path with client-side filtering/mapping
   */
  const entityPermissionsMap = profile?.restricted
    ? entityPermissionMapFrom(grants, entityType as GrantType, profile)
    : {};

  const filteredEntities = profile?.restricted
    ? entityQuery.data?.filter(
        (entity: T) => entityPermissionsMap[entity.id]?.[permission]
      )
    : entityQuery.data;

  return {
    ...entityQuery,
    data: filteredEntities ?? [],
    isLoading: entityQuery.isLoading || grantsLoading,
    error: entityQuery.error,
  };
};
