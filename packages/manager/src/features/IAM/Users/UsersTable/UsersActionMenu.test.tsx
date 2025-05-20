import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsersActionMenu } from './UsersActionMenu';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

// Mock useProfile
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

// Mock useHistory
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

const mockOnDelete = vi.fn();

describe('UsersActionMenu', () => {
  it('should render proxy user actions correctly', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    renderWithTheme(
      <UsersActionMenu
        isProxyUser={true}
        onDelete={mockOnDelete}
        username="test_user"
      />
    );

    // Check if "Manage Access" action is present
    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeVisible();
    await userEvent.click(actionBtn);

    const manageAccessButton = screen.getByText('Manage Access');
    expect(manageAccessButton).toBeVisible();

    // Check if only the proxy user action is rendered
    expect(screen.queryByText('View User Details')).not.toBeInTheDocument();
    expect(screen.queryByText('View Assigned Roles')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete User')).not.toBeInTheDocument();

    // Click "Manage Access" and verify history.push is called with the correct URL
    await userEvent.click(manageAccessButton);
    expect(mockHistory.push).toHaveBeenCalledWith('/iam/users/test_user/roles');
  });

  it('should render non-proxy user actions correctly', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    renderWithTheme(
      <UsersActionMenu
        isProxyUser={false}
        onDelete={mockOnDelete}
        username="test_user"
      />
    );

    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    // Check if "View User Details" action is present
    const viewDetailsButton = screen.getByText('View User Details');
    expect(viewDetailsButton).toBeInTheDocument();

    // Click "View User Details" and verify history.push is called with the correct URL
    await userEvent.click(viewDetailsButton);
    expect(mockHistory.push).toHaveBeenCalledWith(
      '/iam/users/test_user/details'
    );

    // Check if "View Assigned Roles" action is present
    const viewRolesButton = screen.getByText('View Assigned Roles');
    expect(viewRolesButton).toBeInTheDocument();

    // Click "View Assigned Roles" and verify history.push is called with the correct URL
    await userEvent.click(viewRolesButton);
    expect(mockHistory.push).toHaveBeenCalledWith('/iam/users/test_user/roles');

    // Check if "Delete User" action is present
    const deleteUserButton = screen.getByText('Delete User');
    expect(deleteUserButton).toBeInTheDocument();

    // Click "Delete User" and verify onDelete is called with the correct username
    await userEvent.click(deleteUserButton);
    expect(mockOnDelete).toHaveBeenCalledWith('test_user');
  });

  it("should disable 'Delete User' action for the currently active user", async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    renderWithTheme(
      <UsersActionMenu
        isProxyUser={false}
        onDelete={mockOnDelete}
        username="current_user"
      />
    );

    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    // Check if "Delete User" action is present but disabled
    const deleteUserButton = screen.getByTestId('Delete User');
    expect(deleteUserButton).toBeInTheDocument();
    expect(deleteUserButton).toHaveAttribute('aria-disabled', 'true');

    // Check for tooltip text
    const tooltip = screen.getByRole('button', {
      name: "You can't delete the currently active user.",
    });
    expect(tooltip).toBeInTheDocument();
  });
});
