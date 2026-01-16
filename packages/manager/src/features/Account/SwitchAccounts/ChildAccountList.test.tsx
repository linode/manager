import { profileFactory } from '@linode/utilities';
import { waitFor, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { ChildAccountList } from 'src/features/Account/SwitchAccounts/ChildAccountList';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { ChildAccountListProps } from './ChildAccountList';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const props: ChildAccountListProps = {
  currentTokenWithBearer: 'Bearer 123',
  childAccounts: [],
  onClose: vi.fn(),
  onSwitchAccount: vi.fn(),
  userType: undefined,
  errors: {
    childAccountInfiniteError: false,
    allChildAccountsError: null,
  },
  fetchNextPage: vi.fn(),
  filter: {},
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  isSwitchingChildAccounts: false,
  refetchFn: vi.fn(),
  setIsSwitchingChildAccounts: vi.fn(),
};

it('should display a list of child accounts', async () => {
  queryMocks.useProfile.mockReturnValue({
    data: profileFactory.build({ user_type: 'parent' }),
  });

  const { findByTestId } = renderWithTheme(
    <ChildAccountList
      {...props}
      childAccounts={accountFactory.buildList(5, { company: 'Child Co.' })}
    />
  );

  await waitFor(async () => {
    expect(await findByTestId('child-account-list')).not.toBeNull();
  });

  const childAccounts = await findByTestId('child-account-list');

  expect(
    within(childAccounts).getAllByText('Child Co.', { exact: false })
  ).toHaveLength(5);
});
