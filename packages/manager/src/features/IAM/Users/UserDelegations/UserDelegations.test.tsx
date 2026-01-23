import { childAccountFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ACCOUNT_DELEGATIONS_TEXT } from '../../Shared/constants';
import { UserDelegations } from './UserDelegations';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useAllGetDelegatedChildAccountsForUserQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetDelegatedChildAccountsForUserQuery:
      queryMocks.useGetDelegatedChildAccountsForUserQuery,
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
  });

  it('should display no roles text if no roles are assigned to user', async () => {
    queryMocks.useAllGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: childAccountFactory.buildList(0),
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />);

    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ACCOUNT_DELEGATIONS_TEXT)).toBeVisible();
  });

  it('should display table if user has delegations', async () => {
    queryMocks.useAllGetDelegatedChildAccountsForUserQuery.mockReturnValue({
      data: [
        {
          company: 'Test Account 1',
          euuid: '123',
        },
      ],
      isLoading: false,
    });

    renderWithTheme(<UserDelegations />, {
      flags: {
        iamDelegation: {
          enabled: true,
        },
      },
    });
    expect(screen.getByText('Account Delegations')).toBeVisible();
  });
});
