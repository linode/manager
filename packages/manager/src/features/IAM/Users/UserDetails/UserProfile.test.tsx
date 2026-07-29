import { screen, within } from '@testing-library/react';
import React from 'react';

import { createUser, createUserRoles } from '../../factories';
import {
  expectNotificationBannerText,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { UserProfile } from './UserProfile';

const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
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
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

const getDetailsGrid = (container: HTMLElement) => {
  const grid = container.querySelector('[class*="itemsGrid"]');
  expect(grid).not.toBeNull();

  return within(grid as HTMLElement);
};

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
      data: createUser({
        email: 'test-user@example.com',
        username: 'test-user',
      }),
      error: null,
      isLoading: false,
    });
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
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

    renderWithProviders(<UserProfile />);

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

    renderWithProviders(<UserProfile />);

    return expectNotificationBannerText(
      "You do not have permission to view this user's details."
    );
  });

  it('shows an error state when loading the user fails', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: null,
      error: [{ reason: 'Unable to load user profile.' }],
      isLoading: false,
    });

    renderWithProviders(<UserProfile />);

    expect(screen.getByText('Unable to load user profile.')).toBeVisible();
  });

  it('shows a not found state when the user does not exist', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    });

    renderWithProviders(<UserProfile />);

    expect(screen.getByText('Not Found')).toBeVisible();
    expect(screen.getByText('This page does not exist.')).toBeVisible();
  });

  it('renders the profile panels with the resolved user data and permissions', () => {
    const { container } = renderWithProviders(<UserProfile />);

    expect(queryMocks.usePermissions).toHaveBeenCalledWith('account', [
      'view_user',
      'update_user',
      'delete_user',
      'list_user_permissions',
    ]);
    expect(queryMocks.useAccountUser).toHaveBeenCalledWith('test-user', true);
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('test-user', true);

    const details = getDetailsGrid(container);

    expect(details.getByText('test-user')).toBeVisible();
    expect(details.getByText('test-user@example.com')).toBeVisible();
  });
});
