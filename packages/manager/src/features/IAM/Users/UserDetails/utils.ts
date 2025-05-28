import type {
  AccountAccessRole,
  EntityAccess,
  EntityAccessRole,
  IamUserPermissions,
} from '@linode/api-v4';

/* Calculates the total number of unique roles assigned to a user. */
export const getTotalAssignedRoles = (
  assignedRoles: IamUserPermissions
): number => {
  const accountAccessRoles = assignedRoles.account_access || [];

  const entityAccessRoles = assignedRoles.entity_access
    ? assignedRoles.entity_access
        .map((entity: EntityAccess) => entity.roles)
        .flat()
    : [];

  const combinedRoles: (AccountAccessRole | EntityAccessRole)[] = Array.from(
    new Set([...accountAccessRoles, ...entityAccessRoles])
  );

  return combinedRoles.length;
};
