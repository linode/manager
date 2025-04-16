import type { GrantLevel, Grants, GrantType } from '@linode/api-v4';

/**
 * Gets entity ids for a specified permission level given a user's grants
 * @param grants user grants (probably from React Query)
 * @param entity the entity type you want grants for
 * @param permission the level of permission you want ids for. Omit this for all entity ids.
 * @returns a list of entity ids that match given paramaters
 */
export const getEntityIdsByPermission = (
  grants: Grants | undefined,
  entity: GrantType,
  permission?: GrantLevel,
) => {
  if (!grants) {
    return [];
  }

  if (permission === undefined) {
    return grants[entity].map((grant) => grant.id);
  }

  return grants[entity]
    .filter((grant) => grant.permissions === permission)
    .map((grant) => grant.id);
};
