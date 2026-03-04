import { profileFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SwitchAccountDrawer } from './SwitchAccountDrawer';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  useMyDelegatedChildAccountsQuery: vi.fn().mockReturnValue({}),
  useChildAccountsInfiniteQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useMyDelegatedChildAccountsQuery:
      queryMocks.useMyDelegatedChildAccountsQuery,
    useChildAccountsInfiniteQuery: queryMocks.useChildAccountsInfiniteQuery,
  };
});

const props = {
  onClose: vi.fn(),
  open: true,
  userType: undefined,
};

describe('SwitchAccountDrawer', () => {
  const accounts = accountFactory.buildList(5, {
    company: 'Test Account 1',
    euuid: '123',
  });

  beforeEach(() => {
    queryMocks.useProfile.mockReturnValue({});
    queryMocks.useMyDelegatedChildAccountsQuery.mockReturnValue({
      data: { data: accounts, results: accounts.length, page: 1, pages: 1 },
      isLoading: false,
      isRefetching: false,
    });
    queryMocks.useChildAccountsInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          { data: accounts, results: accounts.length, page: 1, pages: 1 },
        ],
        pageParams: [],
      },
      isInitialLoading: false,
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('should have a title', () => {
    const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
    expect(getByText('Switch Account')).toBeInTheDocument();
  });

  it('should display helper text about the accounts', () => {
    const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
    expect(
      getByText(
        'Select an account to view and manage its settings and configurations',
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it('should have a search bar', () => {
    const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);

    expect(getByText('Search')).toBeVisible();
  });

  it('should include a link to switch back to the parent account if the active user is a proxy user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'proxy' }),
    });

    const { findByLabelText, getByText } = renderWithTheme(
      <SwitchAccountDrawer {...props} userType="proxy" />
    );

    expect(
      getByText(
        'Select an account to view and manage its settings and configurations',
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(await findByLabelText('parent-account-link')).toHaveTextContent(
      'switch back to your account'
    );
  });

  it('should close when the close icon is clicked', async () => {
    const { getByLabelText } = renderWithTheme(
      <SwitchAccountDrawer {...props} />
    );

    const closeIconButton = getByLabelText('Close drawer');
    fireEvent.click(closeIconButton);

    await waitFor(() => {
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
