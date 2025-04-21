import { AccountAccessRole, EntityAccessRole, EntityTypePermissions, IamUserPermissions } from '@linode/api-v4';


const selectedRoles = values.roles.map((r) => ({
  access: r.role?.access,
  entities: r.entities || null,
  role: r.role?.value,
}));

if (selectedRoles.length) {
  const selectedPlusExistingRoles: IamUserPermissions = {
    account_access: existingRoles?.account_access || [],
    entity_access: existingRoles?.entity_access || [],
  };

  // Add the selected Account level roles to the existing ones
  selectedRoles
    .filter((r) => r.access === 'account_access')
    .forEach((r) => {
      selectedPlusExistingRoles.account_access.push(
        r.role as AccountAccessRole
      );
    });

  // Add the selected Entity level roles to the existing ones
  selectedRoles
    .filter((r) => r.access === 'entity_access')
    .forEach((r) => {
      r.entities?.forEach((e) => {
        const existingEntity = selectedPlusExistingRoles.entity_access.find(
          (ee) => ee.id === e.value
        );
        if (existingEntity) {
          existingEntity.roles.push(r.role as EntityAccessRole);
        } else {
          selectedPlusExistingRoles.entity_access.push({
            id: e.value,
            roles: [r.role as EntityAccessRole],
            type: r.role?.split('_')[0] as EntityTypePermissions, // TODO - this needs to be cleaned up
          });
        }
      });
    });


  const mergeAssignedRolesIntoEntityAccess = (assignedRoles:
