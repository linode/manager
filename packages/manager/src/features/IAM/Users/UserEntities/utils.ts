import type { EntitiesRole } from '../../Shared/types';
import type {
  AccountEntity,
  EntityAccess,
  EntityAccessRole,
  EntityType,
  IamUserPermissions,
} from '@linode/api-v4';

export const addEntityNamesToRoles = (
  assignedRoles: IamUserPermissions,
  entities: Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]>
): EntitiesRole[] => {
  const entitiesRoles = assignedRoles.entity_access;

  return entitiesRoles.flatMap((entityRole: EntityAccess) => {
    const entityByType = entities.get(entityRole.type as EntityType);

    if (entityByType) {
      const entity = entityByType.find(
        (res: AccountEntity) => res.id === entityRole.id
      );

      if (entity) {
        return entityRole.roles.map((r: EntityAccessRole) => ({
          access: 'entity_access',
          entity_id: entityRole.id,
          entity_name: entity.label,
          entity_type: entityRole.type,
          id: `${r}-${entityRole.id}`,
          role_name: r,
        }));
      }
    }

    return [];
  });
};

export const getSearchableFields = (role: EntitiesRole): string[] => [
  String(role.entity_id),
  role.entity_name,
  role.entity_type,
  role.role_name,
];
