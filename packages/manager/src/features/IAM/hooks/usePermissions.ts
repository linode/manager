import {
  type AccessType,
  getUserEntityPermissions,
  type PermissionType,
} from '@linode/api-v4';
import {
  useAllLinodesQuery,
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

export const useLinodesWithPermissions = () => {
  const { data: profile } = useProfile();
  const { data: allLinodes } = useAllLinodesQuery();

  const linodesPermissions = useQueries({
    queries: (allLinodes || []).map((linode) => ({
      queryKey: ['linode-permission', linode.id],
      queryFn: () =>
        getUserEntityPermissions(profile?.username || '', 'linode', linode.id),
    })),
  });

  const filtered = allLinodes?.filter((linode, index) => {
    const permissions = linodesPermissions[index]?.data;
    return permissions?.includes('apply_linode_firewalls');
  });

  return filtered || [];
};

export const useQueryWithPermissions = (
  query: any,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
) => {
  const { data: profile } = useProfile();
  const { data: allEntities } = query();

  const entityPermissions: any = useQueries({
    queries: (allEntities || []).map((entity: any) => ({
      queryKey: [entityType, entity.id],
      queryFn: () =>
        getUserEntityPermissions(
          profile?.username || '',
          entityType,
          entity.id
        ),
    })),
  });

  const entities = allEntities?.filter((_entity: any, index: number) => {
    const permissions = entityPermissions[index]?.data;
    return permissionsToCheck.every((permission) =>
      permissions?.includes(permission)
    );
  });

  return { data: entities || [] } as const;
};

export const useQueryWithPermissions2 = (
  query: any,
  entityType: EntityType,
  permissionsToCheck: PermissionType[]
) => {
  const { data: profile } = useProfile();
  const { data: allEntities } = query();
  // const { isIAMEnabled } = useIsIAMEnabled();

  // const { data: grants } = useGrants(!isIAMEnabled);

  const entityPermissions: any = useQueries({
    queries: (allEntities || []).map((entity: any) => ({
      queryKey: [entityType, entity.id],
      queryFn: () =>
        getUserEntityPermissions(
          profile?.username || '',
          entityType,
          entity.id
        ),
    })),
  });

  const entityPermissionsMap = {} as any;
  entityPermissions?.forEach(
    (permission: { data: any }, index: number | string) => {
      entityPermissionsMap[allEntities[index].id] = permission.data;
    }
  );

  // const readOnlyLinodeIds = profile?.restricted
  //   ? getEntityIdsByPermission(grants, 'linode', 'read_only')
  //   : [];

  const entities = allEntities?.filter((entity: any) => {
    return permissionsToCheck.every((permission) =>
      entityPermissionsMap[entity.id]?.includes(permission)
    );
  });

  return { data: entities || [] } as const;
};
