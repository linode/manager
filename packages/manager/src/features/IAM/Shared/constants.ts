// Various constants for the IAM package

// Labels
export const IAM_LABEL = 'Identity and Access';

export const NO_ASSIGNED_ROLES_TEXT = `The user doesn't have any roles assigned yet. Once you assign the role, it will show up here.`;

export const NO_ASSIGNED_ENTITIES_TEXT = `The user doesn't have any entity access roles assigned yet. Once you assign the user a role on specific entities, these entities will show up here.`;

export const INTERNAL_ERROR_NO_CHANGES_SAVED = `Internal Error. No changes were saved.`;

export const LAST_ACCOUNT_ADMIN_ERROR = `Failed to unassigned the role. You need to have at least one user with the account_admin role on your acount.`;

export const ERROR_STATE_TEXT =
  'An unexpected error occurred. Refresh the page or try again later.';

// Links
// TODO: update the link when it's ready - UIE-8534
export const IAM_DOCS_LINK =
  'https://www.linode.com/docs/platform/identity-access-management/';

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
