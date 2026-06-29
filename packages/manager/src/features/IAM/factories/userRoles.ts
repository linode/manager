import type {
  EntityAccess,
  EntityRoleType,
  EntityType,
  IamUserRoles,
} from '@linode/api-v4';

const possibleRoles: EntityRoleType[] = [
  'firewall_admin',
  'firewall_contributor',
  'firewall_viewer',
  'linode_admin',
  'linode_contributor',
  'linode_viewer',
];

export const possibleTypes: EntityType[] = [
  'database',
  'domain',
  'firewall',
  'image',
  'linode',
  'longview',
  'nodebalancer',
  'stackscript',
  'volume',
  'vpc',
];

/**
 * Creates a mock EntityAccess for use in unit tests.
 */
export const createEntityAccess = (
  overrides: Partial<EntityAccess> = {}
): EntityAccess => ({
  id: 1,
  roles: [possibleRoles[0]],
  type: possibleTypes[0],
  ...overrides,
});

/**
 * Creates a mock IamUserRoles for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createUserRoles = (
  overrides: Partial<IamUserRoles> = {}
): IamUserRoles => ({
  account_access: [
    'account_linode_admin',
    'account_linode_creator',
    'account_firewall_creator',
    'account_admin',
    'account_viewer',
  ],
  entity_access: [
    { id: 1, roles: ['firewall_admin'], type: 'firewall' },
    { id: 10, roles: ['linode_contributor', 'linode_viewer'], type: 'linode' },
  ],
  ...overrides,
});

/**
 * Creates a mock IamUserRoles representing the default roles for a delegate user.
 */
export const createUserDefaultRoles = (
  overrides: Partial<IamUserRoles> = {}
): IamUserRoles => ({
  account_access: [
    'account_event_viewer',
    'account_maintenance_viewer',
    'account_notification_viewer',
    'account_oauth_client_admin',
  ],
  entity_access: [],
  ...overrides,
});
