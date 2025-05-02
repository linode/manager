import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ChangeRoleDrawer } from './ChangeRoleDrawer';

import type { ExtendedRoleView } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
    useAccountUserPermissions: queryMocks.useAccountUserPermissions,
  };
});

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual<any>('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

const mockRole: ExtendedRoleView = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const props = {
  onClose: vi.fn(),
  open: true,
  role: mockRole,
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
  it('should render', async () => {
    const { getByText } = renderWithTheme(
      <ChangeRoleDrawer {...props} mode="change-role" />
    );

    // Verify title renders
    getByText('Change Role');
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

    const { getByText } = renderWithTheme(
      <ChangeRoleDrawer {...props} mode="change-role" />
    );

    const autocomplete = screen.getByRole('combobox');

    act(() => {
      // Open the dropdown
      fireEvent.click(autocomplete);

      // Type to filter options
      fireEvent.change(autocomplete, {
        target: { value: 'account_viewer' },
      });
    });

    // Wait for and select the "account_viewer Read" option
    const newRole = await screen.findByText('account_viewer');
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(autocomplete).toHaveValue('account_viewer');
    });

    await userEvent.click(getByText('Save Change'));

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
