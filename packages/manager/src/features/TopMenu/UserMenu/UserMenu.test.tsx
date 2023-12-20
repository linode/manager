import * as React from 'react';

import { accountFactory, profileFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserMenu } from './UserMenu';

// Mock the hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  // useAccount: vi.fn().mockReturnValue({}),
  useAccountManagement: vi.fn().mockReturnValue({}),
  useAccountUser: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

// vi.mock('src/queries/account', async () => {
//   const actual = await vi.importActual<any>('src/queries/account');
//   return {
//     ...actual,
//     useAccount: queryMocks.useAccount,
//   };
// });

vi.mock('src/queries/accountManagement', async () => {
  const actual = await vi.importActual<any>('src/queries/accountManagement');
  return {
    ...actual,
    useAccountManagement: queryMocks.useAccountManagement,
  };
});

vi.mock('src/queries/accountUsers', async () => {
  const actual = await vi.importActual<any>('src/queries/accountUsers');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
  };
});

vi.mock('src/queries/profile', async () => {
  const actual = await vi.importActual<any>('src/queries/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

it('renders without crashing', () => {
  const { getByRole } = renderWithTheme(<UserMenu />);
  expect(getByRole('button')).toBeInTheDocument();
});

// TODO:
it.skip("shows a parent user's username and company name for a parent user", async () => {
  queryMocks.useAccountManagement.mockReturnValue({
    _hasAccountAccess: true,
    _isRestricted: false,
    account: accountFactory.build({ company: 'Parent Company' }),
    profile: profileFactory.build({ username: 'parent-user' }),
  });
  queryMocks.useAccountUser.mockReturnValue({
    data: accountUserFactory.build({ user_type: 'parent' }),
  });

  const { findByText } = renderWithTheme(<UserMenu />, {
    flags: { parentChildAccountAccess: true },
  });

  expect(await findByText('parent-user')).toBeInTheDocument();
  expect(await findByText('Parent Company')).toBeInTheDocument();
});

// TODO:
it("shows the parent user's username and child company name for a proxy user", () => {
  const { getByRole } = renderWithTheme(<UserMenu />);

  expect(getByRole('button')).toBeInTheDocument();
});

// TODO:
it("shows the child user's username and company name for a child user", () => {
  const { getByRole } = renderWithTheme(<UserMenu />);

  expect(getByRole('button')).toBeInTheDocument();
});

// TODO:
it("shows the user's username and no company name for a regular user", () => {
  const { getByRole } = renderWithTheme(<UserMenu />);

  expect(getByRole('button')).toBeInTheDocument();
});
