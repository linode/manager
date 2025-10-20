import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userRolesFactory } from 'src/factories/userRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_ROLES_TEXT,
} from '../../Shared/constants';
import { UserRoles } from './UserRoles';

const mockEntities = [
  accountEntityFactory.build({
    id: 1,
    type: 'firewall',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('UserRoles', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useSearch.mockReturnValue({
      selectedRole: '',
    });
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: true,
      },
    });
  });

  it('should display no roles text if no roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ASSIGNED_ROLES_TEXT)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Assign New Roles' })
    ).toBeVisible();
  });

  it('should display table if no entity access roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<UserRoles />);

    expect(
      screen.getByText('View and manage roles assigned to the user.')
    ).toBeVisible();

    expect(screen.getByText(/All Entities/i)).toBeVisible();
    expect(screen.getByText('account_admin')).toBeVisible();
  });

  it('should display table if no account access roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: [],
        entity_access: [
          {
            id: 1,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('firewall_admin')).toBeVisible();
  });

  it('should exclude the role from the table if the assigned entity (firewall with id 2) was removed', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: ['account_admin'],
        entity_access: [
          {
            id: 2,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('account_admin')).toBeVisible();
    expect(screen.queryByText('firewall_admin')).not.toBeInTheDocument();
  });
  it('should display roles and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for role account_linode_admin'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Unassign Role')).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(<UserRoles />);
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });
});
