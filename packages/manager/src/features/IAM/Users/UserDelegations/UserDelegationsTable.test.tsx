import { childAccountFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDelegationsTable } from './UserDelegationsTable';

const mockChildAccounts = {
  data: [
    {
      company: 'Test Account 1',
      euuid: '123',
    },
    {
      company: 'Test Account 2',
      euuid: '456',
    },
  ],
};

const queryMocks = vi.hoisted(() => ({
  useGetDelegatedChildAccountsForUserQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi
    .fn()
    .mockReturnValue({ data: { roles: [{}] }, isLoading: false }),
  useUserAccountPermissions: vi
    .fn()
    .mockReturnValue({ data: ['is_account_admin'], isLoading: false }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetDelegatedChildAccountsForUserQuery:
      queryMocks.useGetDelegatedChildAccountsForUserQuery,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserAccountPermissions: queryMocks.useUserAccountPermissions,
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

describe('UserDelegationsTable', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: mockChildAccounts,
      isLoading: false,
    });
    queryMocks.useSearch.mockReturnValue({
      query: '',
    });
    // Ensure IAM is considered enabled via account permissions (avoids shape issues)
    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: ['is_account_admin'],
      isLoading: false,
    });
    // Avoid invoking getAllRoles with an unexpected roles shape
    queryMocks.useAccountRoles.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('renders the correct number of child accounts', () => {
    renderWithTheme(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
        iamDelegation: {
          enabled: true,
        },
      },
    });

    screen.getByText('Test Account 1');
    screen.getByText('Test Account 2');
  });

  it('shows pagination when there are more than 25 child accounts', () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: { data: childAccountFactory.buildList(30), results: 30 },
      isLoading: false,
    });

    renderWithTheme(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
        iamDelegation: {
          enabled: true,
        },
      },
    });

    const tabelRows = screen.getAllByRole('row');
    const paginationRow = screen.getByRole('navigation', {
      name: 'pagination navigation',
    });
    expect(tabelRows).toHaveLength(32); // 30 rows + header row + pagination row
    expect(paginationRow).toBeInTheDocument();
  });

  it('filters child accounts by search', async () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: { data: childAccountFactory.buildList(30), results: 30 },
      isLoading: false,
    });

    renderWithTheme(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
        iamDelegation: {
          enabled: true,
        },
      },
    });

    const paginationRow = screen.getByRole('navigation', {
      name: 'pagination navigation',
    });

    screen.getByText('child-account-31');
    screen.getByText('child-account-32');

    expect(paginationRow).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'child-account-31');

    screen.getByText('child-account-31');

    await waitFor(() => {
      expect(screen.queryByText('Child Account 32')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(paginationRow).not.toBeInTheDocument();
    });
  });
});
