import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { accountResourcesFactory } from 'src/factories/accountResources';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ChangeRoleDrawer } from './ChangeRoleDrawer';

import type { ExtendedRoleMap } from '../utilities';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountResources: vi.fn().mockReturnValue({}),
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

vi.mock('src/queries/resources/resources', async () => {
  const actual = await vi.importActual<any>('src/queries/resources/resources');
  return {
    ...actual,
    useAccountResources: queryMocks.useAccountResources,
  };
});

const mockRole: ExtendedRoleMap = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
  resource_ids: null,
  resource_type: 'account',
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
    const { getByText } = renderWithTheme(<ChangeRoleDrawer {...props} />);

    // Verify title renders
    getByText('Change Role');
  });

  it('should allow changing role', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        resource_access: [
          {
            resource_id: 12345678,
            resource_type: 'linode',
            roles: ['linode_contributor'],
          },
        ],
      },
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByText } = renderWithTheme(<ChangeRoleDrawer {...props} />);

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
        resource_access: [
          {
            resource_id: 12345678,
            resource_type: 'linode',
            roles: ['linode_contributor'],
          },
        ],
      });
    });
  });
});
