import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userRolesFactory } from 'src/factories/userRoles';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_ENTITIES_TEXT,
} from '../../Shared/constants';
import { UserEntities } from './UserEntities';

const mockEntities = [
  accountEntityFactory.build({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
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
    useAccountEntities: queryMocks.useAccountEntities,
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

describe('UserEntities', () => {
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

  it('should display no entities text if no entity roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserEntities />);
    expect(screen.getByText('This list is empty')).toBeVisible();

    expect(screen.queryByText('Assign New Roles')).toBeNull();
    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display no entities text if no roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserEntities />);

    expect(screen.getByText('This list is empty')).toBeVisible();

    expect(screen.queryByText('Assign New Roles')).toBeNull();

    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display entities and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<UserEntities />);

    expect(screen.queryByText('Assign New Roles')).toBeNull();

    expect(screen.getByText('firewall_admin')).toBeVisible();
    expect(screen.getByText('firewall-1')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for entity firewall-1'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Remove Assignment')).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(<UserEntities />);
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('should not render if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: false,
      },
    });

    renderWithTheme(<UserEntities />);
    expect(screen.queryByText('This list is empty')).toBeNull();
    expect(screen.queryByText('Assign New Roles')).toBeNull();
    expect(screen.queryByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeNull();
  });
});
