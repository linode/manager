import { profileFactory } from '@linode/utilities';
import React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { UserRow } from './UserRow';

// Because the table row hides certain columns on small viewport sizes,
// we must use this.
beforeAll(() => mockMatchMedia());

describe('UserRow', () => {
  it('renders a username and email', () => {
    const user = accountUserFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });
  it('renders only a username, email, and account access status for a Proxy user', async () => {
    const mockLogin = {
      login_datetime: '2022-02-09T16:19:26',
    };
    const proxyUser = accountUserFactory.build({
      email: 'proxy@proxy.com',
      last_login: mockLogin,
      restricted: true,
      user_type: 'proxy',
      username: 'proxyUsername',
    });

    server.use(
      // Mock the active profile for the child account.
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'child' }));
      })
    );

    const { findByText, queryByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={proxyUser} />)
    );

    // Renders Username, Email, and Account Access fields for a proxy user.
    expect(await findByText('proxyUsername')).toBeInTheDocument();
    expect(await findByText('proxy@proxy.com')).toBeInTheDocument();

    // Does not render the Last Login for a proxy user.
    expect(queryByText('2022-02-09T16:19:26')).not.toBeInTheDocument();
  });

  it('renders "Never" if last_login is null', () => {
    const user = accountUserFactory.build({ last_login: null });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText('Never')).toBeVisible();
  });
  it('renders a timestamp of the last_login if it was successful', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      })
    );

    const user = accountUserFactory.build({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'successful',
      },
    });

    const { findByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');

    expect(date).toBeVisible();
  });
  it('renders a timestamp and "Failed" of the last_login if it was failed', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      })
    );

    const user = accountUserFactory.build({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'failed',
      },
    });

    const { findByText, getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');
    const status = getByText('Failed');

    expect(date).toBeVisible();
    expect(status).toBeVisible();
  });
});
