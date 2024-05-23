import { waitFor, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, profileFactory } from 'src/factories';
import { ChildAccountList } from 'src/features/Account/SwitchAccounts/ChildAccountList';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  currentTokenWithBearer: 'Bearer 123',
  onClose: vi.fn(),
  onSwitchAccount: vi.fn(),
  userType: undefined,
};

beforeAll(() => {
  server.use(
    http.get('*/profile', () => {
      return HttpResponse.json(profileFactory.build({ user_type: 'parent' }));
    })
  );
});

it('should display a list of child accounts', async () => {
  const { findByTestId } = renderWithTheme(<ChildAccountList {...props} />);
  server.use(
    http.get('*/account/child-accounts', () => {
      return HttpResponse.json(
        makeResourcePage(accountFactory.buildList(5, { company: 'Child Co.' }))
      );
    })
  );
  await waitFor(async () => {
    expect(await findByTestId('child-account-list')).not.toBeNull();
  });

  const childAccounts = await findByTestId('child-account-list');

  // Confirm that all child accounts are listed.
  expect(
    within(childAccounts).getAllByText('Child Co.', { exact: false })
  ).toHaveLength(5);
});

it('should display the list of child accounts in alphabetical order', async () => {
  const mockChildAccounts = [
    accountFactory.build({ company: 'Z Child Co.' }),
    accountFactory.build({ company: '42 Child Co.' }),
    accountFactory.build({ company: 'Z Child Co. 2' }),
    accountFactory.build({ company: 'A Child Co.' }),
  ];
  const mockAlphabeticalCompanyNames = [
    '42 Child Co.',
    'A Child Co.',
    'Z Child Co.',
    'Z Child Co. 2',
  ];

  server.use(
    http.get('*/account/child-accounts', () => {
      return HttpResponse.json(makeResourcePage(mockChildAccounts));
    })
  );

  const { findByTestId, getAllByRole } = renderWithTheme(
    <ChildAccountList {...props} />
  );

  await waitFor(async () => {
    expect(await findByTestId('child-account-list')).not.toBeNull();
  });

  const childAccounts = await findByTestId('child-account-list');
  const childAccountCompanyNames = getAllByRole('button').map(
    (account) => account.textContent
  );

  expect(childAccounts).toBeInTheDocument();
  // Confirm that child accounts are listed in alphabetical order by company name.
  expect(childAccountCompanyNames).toEqual(mockAlphabeticalCompanyNames);
});
