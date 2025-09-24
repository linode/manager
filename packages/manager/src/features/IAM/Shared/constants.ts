// Various constants for the IAM package

// Labels
export const IAM_LABEL = 'Identity and Access';

export const NO_ASSIGNED_ROLES_TEXT = `The user doesn't have any roles assigned yet. Once you assign the role, it will show up here.`;

export const NO_ASSIGNED_ENTITIES_TEXT = `The user doesn't have any entity access roles assigned yet. Once you assign the user a role on specific entities, these entities will show up here.`;

export const INTERNAL_ERROR_NO_CHANGES_SAVED = `Internal Error. No changes were saved.`;

export const LAST_ACCOUNT_ADMIN_ERROR =
  'Failed to unassign the role. You need to have at least one user with the account_admin role on your account.';
export const NO_DELEGATIONS_TEXT = 'No delegate users found.';
export const NO_DELEGATIONS_ASSIGNED_TEXT =
  'No delegate users have been assigned to this account.';
export const ERROR_STATE_TEXT =
  'An unexpected error occurred. Refresh the page or try again later.';

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

export const ACCOUNT_DELEGATIONS_TABLE_PREFERENCE_KEY =
  'iam-account-delegations';
