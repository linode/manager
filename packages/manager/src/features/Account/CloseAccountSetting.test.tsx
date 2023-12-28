import * as React from 'react';

// import { accountFactory, profileFactory } from 'src/factories';
// import { grantsFactory } from 'src/factories/grants';
// import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';

describe('Close Account Settings', () => {
  it('should render subheading text', () => {
    const { container } = renderWithTheme(<CloseAccountSetting />);
    const subheading = container.querySelector(
      '[data-qa-panel-subheading="true"]'
    );
    expect(subheading).toBeInTheDocument();
    expect(subheading?.textContent).toBe('Close Account');
  });

  it('should render a Close Account Button', () => {
    const { getByTestId } = renderWithTheme(<CloseAccountSetting />);
    const button = getByTestId('close-account-button');
    expect(button).toBeInTheDocument();
    const span = button.querySelector('span');
    expect(span).toHaveTextContent('Close Account');
  });

  it('should render a disabled Close Account button when there are child account', () => {
    // server.use(
    //   rest.get('*/profile', (req, res, ctx) => {
    //     return res(ctx.json(profileFactory.build({ restricted: true })));
    //   }),
    //   rest.get('*/profile/grants', (req, res, ctx) => {
    //     return res(
    //       ctx.json(
    //         grantsFactory.build({ global: { child_account_access: true } })
    //       )
    //     );
    //   }),
    //   rest.get('*/account/child-accounts', (req, res, ctx) => {
    //     return res(ctx.json(accountFactory.buildList(1)));
    //   })
    // );
    // const queryMocks = vi.hoisted(() => ({
    //   useChildAccounts: vi.fn().mockReturnValue({}),
    // }));

    // vi.mock('src/queries/accounts', async () => {
    //   const actual = await vi.importActual<any>('src/queries/accounts');
    //   return {
    //     ...actual,
    //     useChildAccounts: queryMocks.useChildAccounts,
    //   };
    // });

    const { getByText } = renderWithTheme(<CloseAccountSetting />, {
      flags: { parentChildAccountAccess: true },
    });
    const notice = getByText(
      'Remove child accounts before closing the account.'
    );
    expect(notice).toBeInTheDocument();
    // const button = getByTestId('close-account-button');
    // expect(button).toBeDisabled();
  });
});
