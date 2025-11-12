import {
  useAllFirewallsQuery,
  useAllImagesQuery,
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVolumesQuery,
  useAllVPCsQuery,
  useGetUserEntitiesByPermissionQuery,
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
  username: string | undefined;
}

type EntityQueryResult<T extends FullEntityType> = UseQueryResult<
  T[] | undefined,
  APIError[]
> & { filter: Filter };

// Helper to call the right query hook based on entity type
const useEntityQuery = <T extends FullEntityType>(
  entityType: EntityType,
  filter: Filter,
  params: Params,
  enabled: boolean
): EntityQueryResult<T> => {
  // Call all hooks unconditionally (rules of hooks), enable the right one
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

  // Return the appropriate query result based on entity type
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

export const useGetUserEntitiesByPermission = <T extends FullEntityType>({
  entityType,
  permission,
  username,
  enabled = true,
  filter = {},
  params = {},
}: UseGetEntitiesByPermissionProps) => {
  const { isIAMBeta, isIAMEnabled, profile } = useIsIAMEnabled();

  // Get permission IDs for IAM users
  const {
    data: entitiesByPermission,
    isLoading: isEntitiesByPermissionLoading,
    error: isEntitiesByPermissionError,
  } = useGetUserEntitiesByPermissionQuery({
    entityType,
    permission,
    username,
    enabled: enabled && isIAMEnabled,
  });

  const useBetaPermissions =
    isIAMEnabled &&
    isIAMBeta &&
    BETA_ACCESS_TYPE_SCOPE.includes(entityType) &&
    LA_ACCOUNT_ADMIN_PERMISSIONS_TO_EXCLUDE.some((blacklistedPermission) =>
      permission.includes(blacklistedPermission)
    ) === false;
  const useLAPermissions = isIAMEnabled && !isIAMBeta;
  const shouldUseIAMPermissions = useBetaPermissions || useLAPermissions;

  // Build filter for IAM restricted users
  const entityIds =
    shouldUseIAMPermissions && profile?.restricted
      ? entitiesByPermission?.map((e) => e.id)
      : undefined;

  const iamFilter = entityIds
    ? { ...filter, '+or': entityIds.map((id) => ({ id })) }
    : filter;

  // Don't enable IAM query if:
  // 1. Still loading permission IDs for restricted users
  // 2. Permission query had an error
  const shouldEnableIamQuery =
    shouldUseIAMPermissions &&
    enabled &&
    !isEntitiesByPermissionError && // 👈 Don't run if permission check failed
    (!profile?.restricted || entityIds !== undefined);

  // Call entity query with appropriate filter
  const iamQuery = useEntityQuery<T>(
    entityType,
    iamFilter,
    params,
    Boolean(shouldEnableIamQuery)
  );

  // Legacy grants path
  const { data: grants, isLoading: grantsLoading } = useGrants(
    !shouldUseIAMPermissions && profile?.restricted && enabled
  );

  const legacyQuery = useEntityQuery<T>(
    entityType,
    filter,
    params,
    !shouldUseIAMPermissions && enabled
  );

  // Return IAM path
  if (shouldUseIAMPermissions) {
    return {
      ...iamQuery,
      filter: iamFilter,
      data: shouldEnableIamQuery ? iamQuery.data : [], // 👈 Only return data if query was enabled
      isLoading: isEntitiesByPermissionLoading || iamQuery.isLoading,
      error: isEntitiesByPermissionError || iamQuery.error,
    };
  }

  // Legacy path with client-side filtering
  const entityPermissionsMap = profile?.restricted
    ? entityPermissionMapFrom(grants, entityType as GrantType, profile)
    : {};

  const filteredEntities = profile?.restricted
    ? legacyQuery.data?.filter(
        (entity: T) => entityPermissionsMap[entity.id]?.[permission]
      )
    : legacyQuery.data;

  return {
    ...legacyQuery,
    data: filteredEntities,
    isLoading: legacyQuery.isLoading || grantsLoading,
    error: legacyQuery.error,
  };
};
