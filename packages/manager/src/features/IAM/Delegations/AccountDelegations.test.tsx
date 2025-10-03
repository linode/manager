import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { AccountDelegations } from './AccountDelegations';

beforeAll(() => mockMatchMedia());

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseGetAllChildAccountsQuery: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mocks.mockNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetAllChildAccountsQuery: mocks.mockUseGetAllChildAccountsQuery,
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
    mocks.mockUseGetAllChildAccountsQuery.mockReturnValue({
      data: mockDelegations,
    });
  });

  it('should render the delegations table with data', async () => {
    renderWithTheme(<AccountDelegations />, {
      flags: {
        iamDelegation: { enabled: true },
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
    mocks.mockUseGetAllChildAccountsQuery.mockReturnValue({
      data: [],
    });

    renderWithTheme(<AccountDelegations />, {
      flags: { iamDelegation: { enabled: true } },
      initialRoute: '/iam',
    });

    await waitFor(() => {
      const emptyElement = screen.getByText(/No delegate users found/);
      expect(emptyElement).toBeInTheDocument();
    });
  });
});
