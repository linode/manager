import { waitFor } from '@testing-library/react';
import React from 'react';

import { createProfile, createUser } from '../../factories';
import {
  mockMatchMedia,
  renderWithProviders,
  wrapWithTableBody,
} from '../../utilities/testHelpers';
import { UserRow } from './UserRow';

// Because the table row hides certain columns on small viewport sizes,
// we must use this.
beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('UserRow', () => {
  it('renders a username and email', async () => {
    const user = createUser();

    const { getByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });

  it('renders username, email, and user type for a Child user', async () => {
    const user = createUser({
      user_type: 'child',
    });

    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ user_type: 'child' }),
    });

    const { getByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();

    await waitFor(() => {
      expect(getByText('User')).toBeVisible();
    });
  });

  it('renders username and user type, and does not render email and last login for a Delegate user', async () => {
    const delegateUser = createUser({
      user_type: 'delegate',
      last_login: null,
    });

    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ user_type: 'child' }),
    });

    const { getAllByText, getByText, queryByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={delegateUser} />)
    );

    expect(getByText(delegateUser.username)).toBeVisible();
    expect(queryByText(delegateUser.email)).not.toBeInTheDocument();
    expect(queryByText('Never')).not.toBeInTheDocument();
    expect(getAllByText('Not applicable').length).toBe(2);
    expect(getByText('Delegate User')).toBeVisible();
  });

  it('renders "Never" if last_login is null', async () => {
    const user = createUser({ last_login: null });

    const { getByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    expect(getByText('Never')).toBeVisible();
  });

  it('renders a timestamp of the last_login if it was successful', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ timezone: 'utc' }),
    });

    const user = createUser({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'successful',
      },
    });

    const { findByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');

    expect(date).toBeVisible();
  });

  it('renders a timestamp and "Failed" of the last_login if it was failed', async () => {
    // Because we are unit testing a timestamp, set our timezone to UTC
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ timezone: 'utc' }),
    });

    const user = createUser({
      last_login: {
        login_datetime: '2023-10-17T21:17:40',
        status: 'failed',
      },
    });

    const { findByText, getByText } = renderWithProviders(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />)
    );

    const date = await findByText('2023-10-17 21:17');
    const status = getByText('Failed');

    expect(date).toBeVisible();
    expect(status).toBeVisible();
  });
});
