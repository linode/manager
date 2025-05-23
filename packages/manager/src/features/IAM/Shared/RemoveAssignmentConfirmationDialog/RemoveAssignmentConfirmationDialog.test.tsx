import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ username: 'test_user' }),
  };
});

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

describe('RemoveAssignmentConfirmationDialog', () => {
  it('should render', () => {
    renderWithTheme(
      <MemoryRouter>
        <RemoveAssignmentConfirmationDialog {...props} />{' '}
      </MemoryRouter>
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
    queryMocks.useAccountUserPermissions.mockReturnValue({
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

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
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
});
