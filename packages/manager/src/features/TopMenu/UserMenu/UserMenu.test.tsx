import { fireEvent, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, profileFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { UserMenu } from './UserMenu';

// We have to do this because if we don't, the <Hidden /> username doesn't render.
beforeAll(() => mockMatchMedia());

describe('UserMenu', () => {
  it('renders without crashing', () => {
    const { getByRole } = renderWithTheme(<UserMenu />);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it("shows a parent user's username and company name for a parent user", async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Parent Company' }))
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              user_type: 'parent',
              username: 'parent-user',
            })
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    expect(await findByText('parent-user')).toBeInTheDocument();
    expect(await findByText('Parent Company')).toBeInTheDocument();
  });

  it("shows the parent user's username and child company name for a proxy user", async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Child Company' }))
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              user_type: 'proxy',
              username: 'parent-user',
            })
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    expect(await findByText('parent-user')).toBeInTheDocument();
    expect(await findByText('Child Company')).toBeInTheDocument();
  });

  it("shows the child user's username and company name for a child user", async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Child Company' }))
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({ user_type: 'child', username: 'child-user' })
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    expect(await findByText('child-user')).toBeInTheDocument();
    expect(await findByText('Child Company')).toBeInTheDocument();
  });

  it("shows the user's username and no company name for a regular user", async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.json(accountFactory.build({ company: 'Test Company' })));
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              user_type: 'default',
              username: 'regular-user',
            })
          )
        );
      })
    );

    const { findByText, queryByText } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    expect(await findByText('regular-user')).toBeInTheDocument();
    expect(queryByText('Test Company')).not.toBeInTheDocument();
  });

  it('shows the parent company name and Switch Account button in the dropdown menu for a parent user', async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Parent Company' }))
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ user_type: 'parent' })));
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(within(userMenuPopover).getByText('Parent Company')).toBeVisible();
    expect(within(userMenuPopover).getByText('Switch Account')).toBeVisible();
  });

  it('hides Switch Account button for parent accounts lacking child_account_access', async () => {
    server.use(
      rest.get('*/account/users/*/grants', (req, res, ctx) => {
        return res(
          ctx.json(
            grantsFactory.build({ global: { child_account_access: false } })
          )
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({ restricted: true, user_type: 'parent' })
          )
        );
      })
    );

    const { findByLabelText, queryByTestId } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    expect(queryByTestId('switch-account-button')).not.toBeInTheDocument();
  });

  it('shows the child company name and Switch Account button in the dropdown menu for a proxy user', async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Child Company' }))
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ user_type: 'proxy' })));
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(within(userMenuPopover).getByText('Child Company')).toBeVisible();
    expect(within(userMenuPopover).getByText('Switch Account')).toBeVisible();
  });

  it('shows the parent email for a parent user if their company name is not set', async () => {
    // Mock a forbidden request to the /account endpoint, which happens if Billing (Account) Access is None.
    server.use(
      rest.get('*/account/users/*/grants', (req, res, ctx) => {
        return res(
          ctx.json(
            grantsFactory.build({
              global: {
                account_access: null,
              },
            })
          )
        );
      }),
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.status(403));
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              email: 'parent@parent.com',
              user_type: 'parent',
              username: 'parent-username',
            })
          )
        );
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />, {
      flags: { parentChildAccountAccess: true },
    });

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(
      within(userMenuPopover).getByText('parent@parent.com')
    ).toBeVisible();
  });
});
