// Pendo IDs for Parent Users flow
export const IAM_PARENT_USERS_PENDO_IDS = {
  parentUsernameLink: 'IAM Users-Parent Username',
  parentUsernameActionMenu: 'IAM Users Parent Username-Action menu',
  addUserButton: 'IAM Users Parent-Add A User',
  addUserDrawerSubmit: 'IAM Users Parent Add A User-Add User',
  updateDelegation: 'IAM Account Delegations-Update Delegation',
  updateDelegationSave: 'IAM Update Delegation-Save Changes',
};
// Pendo IDs for Delegate Users flow
export const IAM_DELEGATE_USERS_PENDO_IDS = {
  addUserButton: 'IAM Users Delegate-Add A User',
  addUserDrawerSubmit: 'IAM Users Delegate Add A User-Add User',
  delegateUsernameActionMenu: 'IAM Users Delegate Username-Action menu',
  delegateUsernameLink: 'IAM Users-Delegate Username',
};
// Pendo IDs for Child Users flow
export const IAM_CHILD_USERS_PENDO_IDS = {
  childUsernameLink: 'IAM Users-Child Username',
  childUsernameActionMenu: 'IAM Users Child Username-Action menu',
  addUserButton: 'IAM Users Child-Add A User',
  addUserDrawerSubmit: 'IAM Users Child Add A User-Add User',
};

// Pendo IDs for Roles pages (Parent & Child)
export const IAM_ROLES_PENDO_IDS = {
  viewDefaultRoles: 'IAM Roles-View Default Roles',
  delegateUsersActionMenu: 'IAM Roles Delegate Users-Action menu',
  addNewDefaultRoles: 'IAM Roles for Delegate Users-Add New Default Roles',
  addNewDefaultRolesDrawer:
    'IAM Roles for Delegate Users Add New Default Roles-Add',
  rolesChecked: 'IAM Roles-Roles checked',
  assignSelectedRoles: 'IAM Roles-Assign Selected Roles',
  assignSelectedRoleToUserDelegate:
    'IAM Roles Assign Selected Role to a User-Delegate User',
  assignSelectedRoleToUserParent:
    'IAM Roles Assign Selected Role to a User-Parent User',
  assignSelectedRoleToChildUser:
    'IAM Roles Assign Selected Role to a User-Child User',
  assignSelectedRoleToUserAssign:
    'IAM Roles Assign Selected Role to a User-Assign',
  assignRole: 'IAM Roles-Assign Role',
};
// Various constants for the IAM package

// Labels
export const IAM_LABEL = 'Identity and Access';

export const NO_ASSIGNED_ROLES_TEXT = `The user doesn't have any roles assigned yet. Once you assign the role, it will show up here.`;

export const NO_ASSIGNED_DEFAULT_ROLES_TEXT = `There are no default roles assigned yet. Once you assign a role, it will appear here.`;

export const NO_ASSIGNED_ENTITIES_TEXT = `The user doesn't have any entity access roles assigned yet. Once you assign the user a role on specific entities, these entities will show up here.`;

export const NO_ASSIGNED_DEFAULT_ENTITIES_TEXT = `There are no default entity access roles assigned yet. Once you assign the default role on specific entities, these entities will show up here.`;

export const NO_ACCOUNT_DELEGATIONS_TEXT = `The user is not added to any account delegations. Once the user is added to an account delegation for specific child accounts, their list will show up here.`;

export const INTERNAL_ERROR_NO_CHANGES_SAVED = `Internal Error. No changes were saved.`;

export const LAST_ACCOUNT_ADMIN_ERROR =
  'Failed to unassign the role. You need to have at least one user with the account_admin role on your account.';

export const ERROR_STATE_TEXT =
  'An unexpected error occurred. Refresh the page or try again later.';

// Delegation error messages
export const NO_ITEMS_TO_DISPLAY_TEXT = 'No items to display.';
export const NO_DELEGATED_USERS_TEXT = 'No users added.';

// Links
export const IAM_DOCS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/identity-and-access-cm';

export const ROLES_LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/identity-access-cm-available-roles';

export const USER_DETAILS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/identity-access-cm-manage-access';

export const USER_ROLES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/identity-access-cm-manage-access#check-and-update-users-role-assignment';

export const USER_ENTITIES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/identity-access-cm-manage-access#check-and-update-users-entity-assignment';

export const PAID_ENTITY_TYPES = [
  'database',
  'linode',
  'nodebalancer',
  'volume',
  'image',
];

export const ROLES_TABLE_PREFERENCE_KEY = 'roles';

export const ENTITIES_TABLE_PREFERENCE_KEY = 'entities';

export const ASSIGNED_ROLES_TABLE_PREFERENCE_KEY = 'assigned-roles';
