import { fireEvent, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories/account';
import { accountUserFactory } from 'src/factories/accountUsers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SwitchAccountDrawer } from './SwitchAccountDrawer';

const props = {
  isProxyUser: false,
  onClose: vi.fn(),
  open: true,
  username: 'mock-user',
};

describe('SwitchAccountDrawer', () => {
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

  it('should include a link to switch back to the parent account if the active user is a proxy user', async () => {
    server.use(
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'proxy' })));
      })
    );

    const { findByLabelText, getByText } = renderWithTheme(
      <SwitchAccountDrawer {...props} isProxyUser />
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

  it('should display a list of child accounts', async () => {
    server.use(
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

    const { findByTestId } = renderWithTheme(
      <SwitchAccountDrawer {...props} />
    );

    const childAccounts = await findByTestId('child-account-list');
    expect(
      within(childAccounts).getAllByText('Child Co.', { exact: false })
    ).toHaveLength(5);
  });

  it('should close when the close icon is clicked', () => {
    const { getByLabelText } = renderWithTheme(
      <SwitchAccountDrawer {...props} />
    );

    const closeIconButton = getByLabelText('Close drawer');
    fireEvent.click(closeIconButton);

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
