import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { createAccountRoles, createChildAccountList } from '../../factories';
import { getCdsTableRows } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
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
  useNavigate: vi.fn(),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetDelegatedChildAccountsForUserQuery:
      queryMocks.useGetDelegatedChildAccountsForUserQuery,
    useAccountRoles: queryMocks.useAccountRoles,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

describe('UserDelegationsTable', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(navigate);
    navigate.mockReset();
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: mockChildAccounts,
      isLoading: false,
    });
    queryMocks.useSearch.mockReturnValue({
      company: '',
    });
    // Ensure IAM is considered enabled
    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
      isLoading: false,
    });
  });

  it('renders the correct number of child accounts', () => {
    renderWithProviders(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
      },
    });

    screen.getByText('Test Account 1');
    screen.getByText('Test Account 2');
  });

  it('shows pagination when there are more than 25 child accounts', async () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: { data: createChildAccountList(30), results: 30 },
      isLoading: false,
    });

    const { container } = renderWithProviders(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
      },
    });

    const tableRows = await getCdsTableRows(container);
    const pagination = screen.getByTestId('user-delegations-table-pagination');
    expect(tableRows).toHaveLength(31); // 30 data rows + header row
    expect(pagination).toBeInTheDocument();
  });

  it('filters child accounts by search', async () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: { data: createChildAccountList(30), results: 30 },
      isLoading: false,
    });

    const { container } = renderWithProviders(<UserDelegationsTable />, {
      flags: {
        iam: { enabled: true },
      },
    });

    const searchField = container.querySelector('cds-search-field');
    fireEvent(
      searchField!,
      new CustomEvent('change', {
        bubbles: true,
        detail: { value: 'child-account-31' },
      })
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: { company: 'child-account-31' },
        })
      );
    });
  });
});
