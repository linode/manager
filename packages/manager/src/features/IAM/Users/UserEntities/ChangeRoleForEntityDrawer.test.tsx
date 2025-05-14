import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';

import type { EntitiesRole } from '../../Shared/types';

const queryMocks = vi.hoisted(() => ({
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

const mockRole: EntitiesRole = {
  access: 'entity_access',
  entity_type: 'linode',
  id: 'linode_contributor-1',
  entity_id: 1,
  entity_name: 'test 2',
  role_name: 'linode_contributor',
};

const props = {
  mode: 'change-role-for-entity' as const,
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

describe('ChangeRoleForEntityDrawer', () => {
  it('should render', async () => {
    renderWithTheme(<ChangeRoleForEntityDrawer {...props} />);

    // Verify title renders
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(
      screen.getByText('Select a role you want the entity to be attached to.')
    ).toBeVisible();
  });

  it('should allow changing role for entity from "linode_contributor" to "linode_viewer"', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      }),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    renderWithTheme(<ChangeRoleForEntityDrawer {...props} />);

    const autocomplete = screen.getByRole('combobox');

    // Open the dropdown
    await userEvent.click(autocomplete);

    // Type to filter options
    await userEvent.type(autocomplete, 'linode_viewer');

    // Wait for and select the "linode_viewer" option
    const newRole = await screen.findByText('linode_viewer');
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(autocomplete).toHaveValue('linode_viewer');
    });

    await userEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_viewer'],
            type: 'linode',
          },
        ],
      });
    });
  });
});
