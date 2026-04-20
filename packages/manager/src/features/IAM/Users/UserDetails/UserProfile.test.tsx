import { screen } from '@testing-library/react';
import React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { userRolesFactory } from 'src/factories/userRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserProfile } from './UserProfile';

const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.useParams.mockReturnValue({ username: 'test-user' });
    queryMocks.usePermissions.mockReturnValue({
      data: {
        delete_user: true,
        list_user_permissions: true,
        update_user: true,
        view_user: true,
      },
      isLoading: false,
    });
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({
        email: 'test-user@example.com',
        username: 'test-user',
      }),
      error: null,
      isLoading: false,
    });
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });
  });

  it('renders a loading state while the user is loading', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithTheme(<UserProfile />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows a permission notice when the user cannot view user details', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        delete_user: true,
        list_user_permissions: false,
        update_user: true,
        view_user: false,
      },
      isLoading: false,
    });

    renderWithTheme(<UserProfile />);

    expect(
      screen.getByText(
        "You do not have permission to view this user's details."
      )
    ).toBeVisible();
  });

  it('shows an error state when loading the user fails', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: null,
      error: [{ reason: 'Unable to load user profile.' }],
      isLoading: false,
    });

    renderWithTheme(<UserProfile />);

    expect(screen.getByText('Unable to load user profile.')).toBeVisible();
  });

  it('shows a not found state when the user does not exist', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    });

    renderWithTheme(<UserProfile />);

    expect(screen.getByText('Not Found')).toBeVisible();
    expect(screen.getByText('This page does not exist.')).toBeVisible();
  });

  it('renders the profile panels with the resolved user data and permissions', () => {
    renderWithTheme(<UserProfile />);

    expect(queryMocks.usePermissions).toHaveBeenCalledWith('account', [
      'view_user',
      'update_user',
      'delete_user',
      'list_user_permissions',
    ]);
    expect(queryMocks.useAccountUser).toHaveBeenCalledWith('test-user', true);
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('test-user', true);

    expect(screen.getByText('test-user')).toBeVisible();

    expect(screen.getByLabelText('Email')).toHaveDisplayValue(
      'test-user@example.com'
    );
  });
});
