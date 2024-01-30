import { waitFor, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories/account';
import { accountUserFactory } from 'src/factories/accountUsers';
import { ChildAccountList } from 'src/features/Account/SwitchAccounts/ChildAccountList';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  currentTokenWithBearer: 'Bearer 123',
  isProxyUser: false,
  onClose: vi.fn(),
  onSwitchAccount: vi.fn(),
};

it('should display a list of child accounts', async () => {
  server.use(
    rest.get('*/account/users/*', (req, res, ctx) => {
      return res(ctx.json(accountUserFactory.build({ user_type: 'parent' })));
    }),
    rest.get('*/account/child-accounts', (req, res, ctx) => {
      return res(
        ctx.json(
          makeResourcePage(
            accountFactory.buildList(5, { company: 'Child Co.' })
          )
        )
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
