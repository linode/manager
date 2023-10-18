import React from 'react';

import { profileFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { UserRow } from './UserRow';

describe('UserRow', () => {
  it('renders a username and email', () => {
    const user = accountUserFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });
  it('renders "Full" if the user is unrestricted', () => {
    const user = accountUserFactory.build({ restricted: false });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    expect(getByText('Full')).toBeVisible();
  });
  it('renders "Limited" if the user is restricted', () => {
    const user = accountUserFactory.build({ restricted: true });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    expect(getByText('Limited')).toBeVisible();
  });
  it('renders "Never" if last_login is null', () => {
    const user = accountUserFactory.build({ last_login: null });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    expect(getByText('Never')).toBeVisible();
  });
  it('renders a timestamp of the last_login if it was successful', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ timezone: 'utc' })));
      })
    );

    const user = accountUserFactory.build({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'successful',
      },
    });

    const { findByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');

    expect(date).toBeVisible();
  });
  it('renders a timestamp and "Failed" of the last_login if it was failed', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ timezone: 'utc' })));
      })
    );

    const user = accountUserFactory.build({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'failed',
      },
    });

    const { findByText, getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={jest.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');
    const status = getByText('Failed');

    expect(date).toBeVisible();
    expect(status).toBeVisible();
  });
});
