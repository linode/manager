import { screen, within } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { mockMatchMedia, renderWithProviders } from '../utilities/testHelpers';
import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccountWithDelegates, User } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const mocks = vi.hoisted(() => ({
  useAccountUsers: vi.fn(),
  useAllAccountUsersQuery: vi.fn(),
  usePermissions: vi.fn(),
  mockUseUpdateChildAccountDelegatesQuery: vi.fn(),
  mockMutateAsync: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsers: mocks.useAccountUsers,
    useAllAccountUsersQuery: mocks.useAllAccountUsersQuery,
    useUpdateChildAccountDelegatesQuery:
      mocks.mockUseUpdateChildAccountDelegatesQuery,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => ({
  usePermissions: mocks.usePermissions,
}));

const mockUsers: User[] = [
  {
    email: 'user1@example.com',
    last_login: null,
    password_created: null,
    restricted: false,
    ssh_keys: [],
    tfa_enabled: false,
    user_type: 'default',
    username: 'user1',
    verified_phone_number: null,
  },
];

const mockChildAccountWithDelegates: ChildAccountWithDelegates = {
  company: 'Test Company',
  euuid: 'E1234567-89AB-CDEF-0123-456789ABCDEF',
  users: ['user1'],
};

const defaultProps = {
  delegation: mockChildAccountWithDelegates,
  onClose: vi.fn(),
  open: true,
};

describe('UpdateDelegationsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useAccountUsers.mockReturnValue({
      data: { data: mockUsers, results: mockUsers.length },
      error: undefined,
      isFetching: false,
    });

    mocks.useAllAccountUsersQuery.mockReturnValue({
      isFetching: false,
      refetch: vi.fn().mockResolvedValue({ data: mockUsers }),
    });

    mocks.usePermissions.mockReturnValue({
      data: { update_delegate_users: true },
    });

    mocks.mockUseUpdateChildAccountDelegatesQuery.mockReturnValue({
      mutateAsync: mocks.mockMutateAsync,
    });
  });

  it('renders the drawer with current delegates', () => {
    renderWithProviders(<UpdateDelegationsDrawer {...defaultProps} />);

    expect(
      within(screen.getByTestId('drawer')).getByText('Update Delegation')
    ).toBeInTheDocument();
    expect(screen.getByText(/test company/i)).toBeInTheDocument();
    // user1 is returned by the mocked API and appears as a table row
    expect(screen.getByText('user1')).toBeInTheDocument();
  });
});
