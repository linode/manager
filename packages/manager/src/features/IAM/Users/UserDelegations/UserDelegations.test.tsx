import { childAccountFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDelegations } from './UserDelegations';

const mockChildAccounts = [
  {
    company: 'Test Account 1',
    euuid: '123',
  },
  {
    company: 'Test Account 2',
    euuid: '456',
  },
];

const queryMocks = vi.hoisted(() => ({
  useAllGetDelegatedChildAccountsForUserQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllGetDelegatedChildAccountsForUserQuery:
      queryMocks.useAllGetDelegatedChildAccountsForUserQuery,
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

describe('UserDelegations', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useAllGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: mockChildAccounts,
      isLoading: false,
    });
    queryMocks.useSearch.mockReturnValue({
      query: '',
    });
  });

  it('renders the correct number of child accounts', () => {
    renderWithTheme(<UserDelegations />, {
      flags: {
        iamDelegation: {
          enabled: true,
        },
      },
    });

    screen.getByText('Test Account 1');
    screen.getByText('Test Account 2');
  });

  it('shows pagination when there are more than 25 child accounts', () => {
    queryMocks.useAllGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: childAccountFactory.buildList(30),
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />, {
      flags: {
        iamDelegation: {
          enabled: true,
        },
      },
    });

    const tabelRows = screen.getAllByRole('row');
    const paginationRow = screen.getByRole('navigation', {
      name: 'pagination navigation',
    });
    expect(tabelRows).toHaveLength(27); // 25 rows + header row + pagination row
    expect(paginationRow).toBeInTheDocument();
  });

  it('filters child accounts by search', async () => {
    queryMocks.useAllGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: childAccountFactory.buildList(30),
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />, {
      flags: {
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
