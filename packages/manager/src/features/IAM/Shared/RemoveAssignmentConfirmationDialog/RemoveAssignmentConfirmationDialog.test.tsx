import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RemoveAssignmentConfirmationDialog } from './RemoveAssignmentConfirmationDialog';

import type { EntitiesRole } from '../types';

const mockRole: EntitiesRole = {
  role_name: 'firewall_admin',
  id: 'firewall_admin-1',
  entity_id: 1,
  entity_name: 'Test',
  entity_type: 'firewall',
  access: 'entity_access',
};

const props = {
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
  role: mockRole,
};

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: false }),
}));

vi.mock('src/features/IAM/hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

const mockDeleteUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserRoles: (username: string, data: any) => {
      mockDeleteUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('RemoveAssignmentConfirmationDialog', () => {
  it('should render', async () => {
    renderWithTheme(
      <RemoveAssignmentConfirmationDialog {...props} username="test_user" />
    );

    const headerText = screen.getByText(
      'Remove the Test entity from the firewall_admin role assignment?'
    );
    expect(headerText).toBeVisible();

    const paragraph = screen.getByText(/You’re about to remove the/i);

    expect(paragraph).toBeVisible();
    expect(paragraph).toHaveTextContent(mockRole.entity_name);
    expect(paragraph).toHaveTextContent(mockRole.role_name);
    expect(paragraph).toHaveTextContent(/test_user/i);

    expect(
      screen.getByText(/This change will be applied immediately./i)
    ).toBeVisible();

    const buttons = screen.getAllByRole('button');
    expect(buttons?.length).toBe(3);
  });

  it('calls onClose when the cancel button is clicked', async () => {
    renderWithTheme(<RemoveAssignmentConfirmationDialog {...props} />);

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();

    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should allow remove the assignment', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            type: 'firewall',
            roles: ['firewall_admin'],
          },
        ],
      },
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });

    renderWithTheme(<RemoveAssignmentConfirmationDialog {...props} />);

    const removeButton = screen.getByText('Remove');
    expect(removeButton).toBeVisible();

    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(mockDeleteUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [],
      });
    });
  });

  it('should render when isDefaultDelegationRolesForChildAccount is true', async () => {
    queryMocks.useIsDefaultDelegationRolesForChildAccount.mockReturnValue({
      isDefaultDelegationRolesForChildAccount: true,
    });
    renderWithTheme(<RemoveAssignmentConfirmationDialog {...props} />);

    const headerText = screen.getByText(
      'Remove the Test entity from the list?'
    );
    expect(headerText).toBeVisible();

    const paragraph = screen.getByText(/Delegated users won’t get the/i);

    expect(paragraph).toBeVisible();
    expect(paragraph).toHaveTextContent(mockRole.entity_name);
    expect(paragraph).toHaveTextContent(mockRole.role_name);
  });
});
