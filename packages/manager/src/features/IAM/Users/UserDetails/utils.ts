import type { IamUserRoles } from '@linode/api-v4';

/* Calculates the total number of unique roles assigned to a user. */
export const getTotalAssignedRoles = (assignedRoles: IamUserRoles): number => {
  const accountAccessRoles = assignedRoles.account_access || [];

  const entityAccessRoles =
    assignedRoles.entity_access?.flatMap((entity) => entity.roles || []) ?? [];

  const combinedRoles = Array.from(
    new Set([...accountAccessRoles, ...entityAccessRoles])
  );

  return combinedRoles.length;
};
