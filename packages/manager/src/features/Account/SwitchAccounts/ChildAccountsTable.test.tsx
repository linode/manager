import React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ChildAccountsTable } from './ChildAccountsTable';

import type { ChildAccountsTableProps } from './ChildAccountsTable';

const childAccounts = accountFactory.buildList(5).map((account, i) => ({
  ...account,
  company: `Child Account ${i}`,
}));

const childAccountsWithMoreThan25 = accountFactory
  .buildList(30)
  .map((account, i) => ({
    ...account,
    company: `Child Account ${i}`,
  }));

const props: ChildAccountsTableProps = {
  childAccounts,
  currentTokenWithBearer: 'Bearer 123',
  onSwitchAccount: vi.fn(),
  page: 1,
  pageSize: 25,
  setIsSwitchingChildAccounts: vi.fn(),
  totalResults: 0,
  userType: undefined,
  filter: {},
  isLoading: false,
  isSwitchingChildAccounts: false,
  onClose: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('ChildAccountsTable', () => {
  it('should display a list of child accounts', async () => {
    const { getByTestId, getAllByText } = renderWithTheme(
      <ChildAccountsTable {...props} />
    );

    expect(getByTestId('child-accounts-table')).toHaveAttribute(
      'aria-label',
      'List of Child Accounts'
    );

    childAccounts.forEach((account) => {
      expect(getAllByText(account.company)).toHaveLength(1);
    });
  });

  it('should display pagination when there are more than 25 child accounts', async () => {
    const firstPageAccounts = childAccountsWithMoreThan25.slice(0, 25);

    const { getByTestId } = renderWithTheme(
      <ChildAccountsTable
        {...props}
        childAccounts={firstPageAccounts}
        totalResults={childAccountsWithMoreThan25.length}
      />
    );

    expect(getByTestId('child-accounts-table-pagination')).toBeVisible();
  });

  it('should display an empty state when no child accounts are found', async () => {
    const { getByText } = renderWithTheme(
      <ChildAccountsTable {...props} childAccounts={[]} />
    );

    expect(
      getByText(
        /You don't have access to other accounts. You must be added to a delegation by an account administrator to have access to other accounts./
      )
    ).toBeInTheDocument();
  });
});
