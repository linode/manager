import { fireEvent, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, profileFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
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
        return res(ctx.json(profileFactory.build({ username: 'parent-user' })));
      }),
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'parent' })));
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
        return res(ctx.json(profileFactory.build({ username: 'parent-user' })));
      }),
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'proxy' })));
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
        return res(ctx.json(profileFactory.build({ username: 'child-user' })));
      }),
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'child' })));
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
          ctx.json(profileFactory.build({ username: 'regular-user' }))
        );
      }),
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: null })));
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
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'parent' })));
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

  it('shows the child company name and Switch Account button in the dropdown menu for a proxy user', async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(
          ctx.json(accountFactory.build({ company: 'Child Company' }))
        );
      }),
      rest.get('*/account/users/*', (req, res, ctx) => {
        return res(ctx.json(accountUserFactory.build({ user_type: 'proxy' })));
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
});
