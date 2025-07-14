import {
  type AccessType,
  getUserEntityPermissions,
  type PermissionType,
} from '@linode/api-v4';
import {
  useGrants,
  useProfile,
  useQueries,
  useUserAccountPermissions,
  useUserEntityPermissions,
} from '@linode/queries';

import { fromGrants, toPermissionMap } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type { EntityType } from '@linode/api-v4';

export const usePermissions = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  entityId?: number,
  enabled: boolean = true
): { permissions: Record<PermissionType, boolean> } => {
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: userAccountPermissions } = useUserAccountPermissions(
    isIAMEnabled && accessType === 'account' && enabled
  );

  const { data: userEntityPermisssions } = useUserEntityPermissions(
    accessType,
    entityId!,
    isIAMEnabled && enabled
  );

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermisssions;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants(!isIAMEnabled && enabled);

  const permissionMap = isIAMEnabled
    ? toPermissionMap(
        permissionsToCheck,
        usersPermissions!,
        profile?.restricted
      )
    : fromGrants(
        accessType,
        permissionsToCheck,
        grants!,
        profile?.restricted,
        entityId
      );

  return { permissions: permissionMap } as const;
};

export const useQueryWithPermissions = (
  query: any,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
) => {
  const { data: allEntities } = query();
  const { data: profile } = useProfile();
  const { isIAMEnabled } = useIsIAMEnabled();
  const { data: grants } = useGrants(!isIAMEnabled);
  let hasFilteredEntities = false;

  const entityPermissions: any = useQueries({
    queries: (allEntities || []).map((entity: any) => ({
      queryKey: [entityType, entity.id],
      queryFn: () =>
        getUserEntityPermissions(
          profile?.username || '',
          entityType,
          entity.id
        ),
      enabled: isIAMEnabled,
    })),
  });

  const entities = isIAMEnabled
    ? filterByEntityPermissions(
        allEntities,
        entityPermissions,
        permissionsToCheck
      )
    : filterByGrants(
        allEntities,
        grants,
        profile,
        entityType,
        permissionsToCheck
      );

  return {
    data: entities || [],
    hasFiltered: allEntities?.length !== entities?.length,
  } as const;
};

export const filterByEntityPermissions = (
  allEntities: any[],
  entityPermissions: any[],
  permissionsToCheck: PermissionType[]
): any[] => {
  return allEntities?.filter((_entity: any, index: number) => {
    const permissions = entityPermissions[index]?.data;
    return permissionsToCheck.every((permission) =>
      permissions?.includes(permission)
    );
  });
};

export const filterByGrants = (
  allEntities: any[],
  grants: any,
  profile: any,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
): any[] => {
  return allEntities?.filter((entity: any) => {
    const permissionMap = fromGrants(
      entityType,
      permissionsToCheck,
      grants,
      profile?.restricted,
      entity.id
    );
    return permissionsToCheck.every((permission) => permissionMap[permission]);
  });
};
