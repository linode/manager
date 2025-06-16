import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { UsersActionMenu } from './UsersActionMenu';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => navigate),
}));

// Mock useProfile
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const mockOnDelete = vi.fn();

describe('UsersActionMenu', () => {
  it('should render proxy user actions correctly', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    renderWithThemeAndRouter(
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
    expect(navigate).toHaveBeenCalledWith({
      params: {
        username: 'test_user',
      },
      to: '/iam/users/$username/roles',
    });
  });

  it('should render non-proxy user actions correctly', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    renderWithThemeAndRouter(
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
    expect(navigate).toHaveBeenCalledWith({
      params: {
        username: 'test_user',
      },
      to: '/iam/users/$username/details',
    });

    // Check if "View Assigned Roles" action is present
    const viewRolesButton = screen.getByText('View Assigned Roles');
    expect(viewRolesButton).toBeInTheDocument();

    // Click "View Assigned Roles" and verify history.push is called with the correct URL
    await userEvent.click(viewRolesButton);
    expect(navigate).toHaveBeenCalledWith({
      params: {
        username: 'test_user',
      },
      to: '/iam/users/$username/roles',
    });

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

    renderWithThemeAndRouter(
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
