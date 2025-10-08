import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
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

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

describe('UserRow', () => {
  it('renders a username and email', async () => {
    const user = accountUserFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });
  it('renders username, email, and user type for a Child user when isIAMDelegationEnabled flag is enabled', async () => {
    const user = accountUserFactory.build({
      user_type: 'child',
    });

    server.use(
      // Mock the active profile for the child account.
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'child' }));
      })
    );

    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: true },
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();

    await waitFor(() => {
      expect(getByText('User')).toBeVisible();
    });
  });

  it('renders username and user type, and does not render email for a Delegate user when isIAMDelegationEnabled flag is enabled', async () => {
    const delegateUser = accountUserFactory.build({
      user_type: 'proxy', // TODO - change 'proxy' to 'delegate_user'
    });

    server.use(
      // Mock the active profile for the child account.
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'child' }));
      })
    );

    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: true },
    });

    const { getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={delegateUser} />)
    );

    expect(getByText(delegateUser.username)).toBeVisible();

    await waitFor(() => {
      expect(queryByText(delegateUser.email)).not.toBeInTheDocument();
      expect(getByText('Not applicable')).toBeVisible();
      expect(getByText('Delegate User')).toBeVisible();
    });
  });

  it('renders "Never" if last_login is null', async () => {
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
