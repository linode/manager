import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';

import type { ExtendedRoleView } from '../types';

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
  onSuccess: vi.fn(),
  open: true,
  role: mockRole,
};

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
    useAccountUserPermissions: queryMocks.useAccountUserPermissions,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const mockDeleteUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserPermissions: (username: string, data: any) => {
      mockDeleteUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('UnassignRoleConfirmationDialog', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should render', async () => {
    const { getAllByRole, getByText } = await renderWithThemeAndRouter(
      <UnassignRoleConfirmationDialog {...props} />
    );

    const headerText = getByText('Unassign the account_admin role?');
    expect(headerText).toBeVisible();

    const paragraph = getByText(/You’re about to remove the/i).closest('p');

    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent(/account_admin/i);
    expect(paragraph).toHaveTextContent(/test_user/i);
    expect(
      getByText(/The change will be applied immediately./i)
    ).toBeInTheDocument();

    const buttons = getAllByRole('button');
    expect(buttons?.length).toBe(3);
  });

  it('calls the corresponding functions when buttons are clicked', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <UnassignRoleConfirmationDialog {...props} />
    );

    const deleteButton = getByText('Remove');
    expect(deleteButton).toBeVisible();

    const cancelButton = getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should allow unassign `account_admin` role', async () => {
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

    const { getByText } = await renderWithThemeAndRouter(
      <UnassignRoleConfirmationDialog {...props} />
    );

    await userEvent.click(getByText('Remove'));

    await waitFor(() => {
      expect(mockDeleteUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin'],
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
