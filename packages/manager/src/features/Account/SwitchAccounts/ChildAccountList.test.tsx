import { profileFactory } from '@linode/utilities';
import { waitFor, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { ChildAccountList } from 'src/features/Account/SwitchAccounts/ChildAccountList';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  currentTokenWithBearer: 'Bearer 123',
  onClose: vi.fn(),
  onSwitchAccount: vi.fn(),
  searchQuery: '',
  userType: undefined,
};

it('should display a list of child accounts', async () => {
  server.use(
    http.get('*/profile', () => {
      return HttpResponse.json(profileFactory.build({ user_type: 'parent' }));
    }),
    http.get('*/account/child-accounts', () => {
      return HttpResponse.json(
        makeResourcePage(accountFactory.buildList(5, { company: 'Child Co.' }))
      );
    })
  );

  const { findByTestId } = renderWithTheme(<ChildAccountList {...props} />);

  await waitFor(async () => {
    expect(await findByTestId('child-account-list')).not.toBeNull();
  });

  const childAccounts = await findByTestId('child-account-list');

  expect(
    within(childAccounts).getAllByText('Child Co.', { exact: false })
  ).toHaveLength(5);
});
