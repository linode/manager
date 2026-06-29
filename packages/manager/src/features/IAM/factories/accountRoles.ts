import type { IamAccountRoles } from '@linode/api-v4';

interface CreateResourceRoles {
  accountAdmin?: string[];
  admin?: string[];
  contributor?: string[];
  creator?: string[];
  viewer?: string[];
}

export const createResourceRoles = (
  resourceType: string,
  {
    accountAdmin = [],
    admin = [],
    contributor = [],
    creator = [],
    viewer = [],
  }: CreateResourceRoles
) => ({
  roles: [
    accountAdmin.length > 0
      ? {
          description: `Access to perform any supported action on all ${resourceType} instances`,
          name: `account_${resourceType}_admin`,
          permissions: accountAdmin,
        }
      : null,
    admin.length > 0
      ? {
          description: `Access to administer a ${resourceType} instance`,
          name: `${resourceType}_admin`,
          permissions: admin,
        }
      : null,
    contributor.length > 0
      ? {
          description: `Access to update a ${resourceType} instance`,
          name: `${resourceType}_contributor`,
          permissions: contributor,
        }
      : null,
    creator.length > 0
      ? {
          description: `Access to create a ${resourceType} instance`,
          name: `account_${resourceType}_creator`,
          permissions: creator,
        }
      : null,
    viewer.length > 0
      ? {
          description: `Access to view a ${resourceType} instance`,
          name: `${resourceType}_viewer`,
          permissions: viewer,
        }
      : null,
  ].filter(Boolean),
  type: resourceType,
});

const DEFAULT_ACCOUNT_ROLES: IamAccountRoles = {
  account_access: [
    {
      type: 'linode',
      roles: [
        {
          name: 'account_linode_creator',
          description: 'Allows the user to create Linodes in the account.',
          permissions: [],
        },
        {
          name: 'account_linode_admin',
          description:
            'Allows the user to administer all Linodes in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'firewall',
      roles: [
        {
          name: 'account_firewall_creator',
          description: 'Allows the user to create firewalls in the account.',
          permissions: ['create_firewall'],
        },
        {
          name: 'account_firewall_admin',
          description:
            'Allows the user to administer all firewalls in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'account',
      roles: [
        {
          name: 'account_admin',
          description: 'Allows the user to administer the account.',
          permissions: ['is_account_admin'],
        },
        {
          name: 'account_billing_admin',
          description: 'Allows the user to administer billing for the account.',
          permissions: [],
        },
        {
          name: 'account_viewer',
          description: 'Allows the user to view all entities in the account.',
          permissions: [],
        },
      ],
    },
  ],
  entity_access: [
    {
      type: 'linode',
      roles: [
        {
          name: 'linode_viewer',
          description: 'Allows the user to view Linode instances.',
          permissions: [],
        },
        {
          name: 'linode_contributor',
          description: 'Allows the user to view and update Linode instances.',
          permissions: [],
        },
        {
          name: 'linode_admin',
          description: 'Allows the user to administer Linode instances.',
          permissions: [],
        },
      ],
    },
    {
      type: 'firewall',
      roles: [
        {
          name: 'firewall_viewer',
          description: 'Allows the user to view firewall instances.',
          permissions: [],
        },
        {
          name: 'firewall_contributor',
          description: 'Allows the user to view and update firewall instances.',
          permissions: [],
        },
        {
          name: 'firewall_admin',
          description: 'Allows the user to administer firewall instances.',
          permissions: [],
        },
      ],
    },
  ],
};

/**
 * Creates a mock IamAccountRoles for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createAccountRoles = (
  overrides: Partial<IamAccountRoles> = {}
): IamAccountRoles => ({
  ...DEFAULT_ACCOUNT_ROLES,
  ...overrides,
});
