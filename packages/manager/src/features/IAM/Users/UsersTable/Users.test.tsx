import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { UsersLanding } from './Users';

// Because the table row hides certain columns on small viewport sizes,
// we must use this.
beforeAll(() => mockMatchMedia());
const navigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => navigate),
  useProfile: vi.fn().mockReturnValue({}),
  useAccountUsers: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useIsIAMDelegationEnabled: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useAccountUsers: queryMocks.useAccountUsers,
  };
});

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', async () => {
  const actual = await vi.importActual(
    'src/features/IAM/hooks/useIsIAMEnabled'
  );
  return {
    ...actual,
    useIsIAMDelegationEnabled: queryMocks.useIsIAMDelegationEnabled,
  };
});

describe('Users', () => {
  beforeEach(() => {
    queryMocks.useIsIAMDelegationEnabled.mockReturnValue({
      isIAMDelegationEnabled: true,
    });
  });

  it('renders only table and search filter if profile is not a child', async () => {
    const user = accountUserFactory.build();
    queryMocks.useAccountUsers.mockReturnValue({
      data: {
        data: [user],
        page: 1,
        pages: 1,
        results: 1,
      },
    });
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
    });

    const { getByText, getByPlaceholderText, queryByPlaceholderText } =
      renderWithTheme(<UsersLanding />, {
        initialRoute: '/iam',
      });

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
    expect(getByPlaceholderText('Filter')).toBeVisible();

    await waitFor(() => {
      expect(queryByPlaceholderText('All Users Type')).not.toBeInTheDocument();
    });
  });

  it('renders table, select, and search filter if profile is a child and isIAMDelegationEnabled flag is enabled', async () => {
    const user = accountUserFactory.build();
    queryMocks.useAccountUsers.mockReturnValue({
      data: {
        data: [user],
        page: 1,
        pages: 1,
        results: 1,
      },
    });
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    const { getByPlaceholderText, getByLabelText } = renderWithTheme(
      <UsersLanding />,
      {
        initialRoute: '/iam',
        flags: {
          iamDelegation: { enabled: true },
        },
      }
    );

    expect(getByPlaceholderText('Filter')).toBeVisible();
    expect(getByLabelText('Select user type')).toBeVisible();
  });
});
