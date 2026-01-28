import { childAccountFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ACCOUNT_DELEGATIONS_TEXT } from '../../Shared/constants';
import { UserDelegations } from './UserDelegations';

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
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useGetDelegatedChildAccountsForUserQuery: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserAccountPermissions: vi.fn().mockReturnValue({}),
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
    useNavigate: queryMocks.useNavigate,
  };
});

describe('UserDelegations', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useSearch.mockReturnValue({ query: '' });
    queryMocks.useNavigate.mockReturnValue(vi.fn());
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

  it('should display no roles text if no roles are assigned to user', async () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: { data: childAccountFactory.buildList(0), results: 0 },
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />, {
      flags: {
        iam: { enabled: true },
        iamDelegation: {
          enabled: true,
        },
      },
    });
    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ACCOUNT_DELEGATIONS_TEXT)).toBeVisible();
  });

  it('should display table if user has delegations', async () => {
    queryMocks.useGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: mockChildAccounts,
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />, {
      flags: {
        iam: { enabled: true },
        iamDelegation: {
          enabled: true,
        },
      },
    });
    expect(screen.getByText('Account Delegations')).toBeVisible();
  });
});
