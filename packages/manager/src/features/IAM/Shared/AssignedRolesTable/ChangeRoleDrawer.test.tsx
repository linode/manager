import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { ChangeRoleDrawer } from './ChangeRoleDrawer';

import type { ExtendedRoleView } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
    useAccountUserPermissions: queryMocks.useAccountUserPermissions,
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
  };
});

const mockAccountAccessRole: ExtendedRoleView = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const mockEntityAccessRole: ExtendedRoleView = {
  access: 'entity_access',
  description: 'Access to update a linode instance',
  entity_ids: [1],
  entity_names: ['Linode 1'],
  entity_type: 'linode',
  id: 'linode_contributor',
  name: 'linode_contributor',
  permissions: ['update_linode', 'view_linode'],
};

const props = {
  onClose: vi.fn(),
  open: true,
  role: mockAccountAccessRole,
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserPermissions: (username: string, data: any) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('ChangeRoleDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should render', async () => {
    await renderWithThemeAndRouter(
      <ChangeRoleDrawer {...props} mode="change-role" />
    );

    // Verify title renders
    expect(screen.getByText('Change Role')).toBeVisible();
  });

  it('renders the correct text for account_access roles', async () => {
    await renderWithThemeAndRouter(
      <ChangeRoleDrawer {...props} mode="change-role" />
    );

    // Check that the correct text is displayed for account_access
    expect(screen.getByText('Select a role you want to assign.')).toBeVisible();
  });

  it('renders the correct text for entity_access roles', async () => {
    await renderWithThemeAndRouter(
      <ChangeRoleDrawer
        {...props}
        mode="change-role"
        role={mockEntityAccessRole}
      />
    );

    // Check that the correct text is displayed for account_access
    expect(
      screen.getByText('Select a role you want the entities to be attached to.')
    ).toBeVisible();
  });

  it('should allow changing role', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 12345678,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      },
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: accountEntityFactory.build(),
    });

    await renderWithThemeAndRouter(
      <ChangeRoleDrawer {...props} mode="change-role" />
    );

    const autocomplete = screen.getByRole('combobox');

    // Open the dropdown
    await userEvent.click(autocomplete);

    // Type to filter options
    await userEvent.type(autocomplete, 'account_viewer');

    // Wait for and select the "account_viewer Read" option
    const newRole = await screen.findByText('account_viewer');
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(autocomplete).toHaveValue('account_viewer');
    });

    await userEvent.click(screen.getByText('Save Change'));

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_viewer'],
        entity_access: [
          {
            id: 12345678,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      });
    });
  });
});
