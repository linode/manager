import { grantsFactory, profileFactory } from '@linode/utilities';
import { fireEvent, within } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { UserMenu } from './UserMenu';

// We have to do this because if we don't, the <Hidden /> username doesn't render.
beforeAll(() => mockMatchMedia());

describe('UserMenu', () => {
  it('renders without crashing', () => {
    const { getByRole } = renderWithTheme(<UserMenu />);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it("shows a parent user's username and company name in the TopMenu for a parent user", async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Parent Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ user_type: 'parent', username: 'parent-user' })
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />);

    expect(await findByText('parent-user')).toBeInTheDocument();
    expect(await findByText('Parent Company')).toBeInTheDocument();
  });

  it("shows the parent user's username and child company name in the TopMenu for a proxy user", async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Child Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({
            user_type: 'proxy',
            username: 'parent-user',
          })
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />);

    expect(await findByText('parent-user')).toBeInTheDocument();
    expect(await findByText('Child Company')).toBeInTheDocument();
  });

  it("shows the child user's username and company name in the TopMenu for a child user", async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Child Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ user_type: 'child', username: 'child-user' })
        );
      })
    );

    const { findByText } = renderWithTheme(<UserMenu />);

    expect(await findByText('child-user')).toBeInTheDocument();
    expect(await findByText('Child Company')).toBeInTheDocument();
  });

  it("shows the user's username and no company name in the TopMenu for a regular user", async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Test Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({
            user_type: 'default',
            username: 'regular-user',
          })
        );
      })
    );

    const { findByText, queryByText } = renderWithTheme(<UserMenu />);

    expect(await findByText('regular-user')).toBeInTheDocument();
    // Should not be displayed for regular users, only parent/child/proxy users.
    expect(queryByText('Test Company')).not.toBeInTheDocument();
  });

  it('shows the parent company name and Switch Account button in the dropdown menu for a parent user', async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Parent Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'parent' }));
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />);

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(within(userMenuPopover).getByText('Parent Company')).toBeVisible();
    expect(within(userMenuPopover).getByText('Switch Account')).toBeVisible();
  });

  it('hides Switch Account button in the dropdown menu for parent accounts lacking child_account_access', async () => {
    server.use(
      http.get('*/account/users/*/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({ global: { child_account_access: false } })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ restricted: true, user_type: 'parent' })
        );
      })
    );

    const { findByLabelText, queryByTestId } = renderWithTheme(<UserMenu />);

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    expect(queryByTestId('switch-account-button')).not.toBeInTheDocument();
  });

  it('shows the child company name and Switch Account button in the dropdown menu for a proxy user', async () => {
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ company: 'Child Company' })
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'proxy' }));
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />);

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(within(userMenuPopover).getByText('Child Company')).toBeVisible();
    expect(within(userMenuPopover).getByText('Switch Account')).toBeVisible();
  });

  it('shows the parent email for a parent user in the top menu and dropdown menu if their company name is unavailable', async () => {
    // Mock a forbidden request to the /account endpoint, which happens if Billing (Account) Access is None.
    server.use(
      http.get('*/account/users/*/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({
            global: {
              account_access: null,
            },
          })
        );
      }),
      http.get('*/account', () => {
        return HttpResponse.json({}, { status: 403 });
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({
            email: 'parent@parent.com',
            user_type: 'parent',
            username: 'parent-username',
          })
        );
      })
    );

    const { findByLabelText, findByTestId } = renderWithTheme(<UserMenu />);

    const userMenuButton = await findByLabelText('Profile & Account');
    fireEvent.click(userMenuButton);

    const userMenuPopover = await findByTestId('user-menu-popover');

    expect(
      within(userMenuPopover).getByText('parent@parent.com')
    ).toBeVisible();
  });
});
