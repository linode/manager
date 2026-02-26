import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { AccountDelegations } from './AccountDelegations';

beforeAll(() => mockMatchMedia());

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseGetChildAccountsQuery: vi.fn(),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: mocks.usePermissions,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mocks.mockNavigate,
    useParams: mocks.useParams,
    useSearch: mocks.useSearch,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetChildAccountsQuery: mocks.mockUseGetChildAccountsQuery,
  };
});

const mockDelegations = [
  {
    company: 'Company A',
    euuid: 'E1234567-89AB-CDEF-0123-456789ABCDEF',
    users: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  },
  {
    company: 'Company B',
    euuid: 'E2345678-9ABC-DEF0-1234-56789ABCDEF0',
    users: ['jane@example.com'],
  },
];

describe('AccountDelegations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUseGetChildAccountsQuery.mockReturnValue({
      data: { data: mockDelegations, results: mockDelegations.length },
      isLoading: false,
    });
    mocks.usePermissions.mockReturnValue({
      data: { list_all_child_accounts: true },
      isLoading: false,
    });
  });

  it('should render the delegations table with data', async () => {
    renderWithTheme(<AccountDelegations />, {
      flags: {
        iamDelegation: { enabled: true },
        iam: { enabled: true },
      },
      initialRoute: '/iam',
    });

    await waitFor(() => {
      screen.getByLabelText('List of Account Delegations');
    });

    const table = screen.getByLabelText('List of Account Delegations');
    const companyA = screen.getByText('Company A');
    const companyB = screen.getByText('Company B');

    expect(table).toBeInTheDocument();
    expect(companyA).toBeInTheDocument();
    expect(companyB).toBeInTheDocument();
  });

  it('should render empty state when no delegations', async () => {
    mocks.mockUseGetChildAccountsQuery.mockReturnValue({
      data: { data: [], results: 0 },
      isLoading: false,
    });

    renderWithTheme(<AccountDelegations />, {
      flags: { iamDelegation: { enabled: true }, iam: { enabled: true } },
      initialRoute: '/iam',
    });

    await waitFor(() => {
      const emptyElement = screen.getByText(/No items to display/);
      expect(emptyElement).toBeInTheDocument();
    });
  });

  it('should not render if user does not have permissions', () => {
    mocks.usePermissions.mockReturnValue({
      data: {
        list_all_child_accounts: false,
      },
      isLoading: false,
    });

    renderWithTheme(<AccountDelegations />, {
      flags: { iamDelegation: { enabled: true }, iam: { enabled: true } },
      initialRoute: '/iam',
    });
    expect(
      screen.queryByText(
        'You do not have permission to view account delegations.'
      )
    ).toBeVisible();
  });
});
