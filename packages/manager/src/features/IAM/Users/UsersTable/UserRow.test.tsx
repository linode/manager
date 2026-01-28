import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
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
  useIsIAMDelegationEnabled: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', async () => {
  const actual = await vi.importActual(
    'src/features/IAM/hooks/useIsIAMEnabled'
  );
  return {
    ...actual,
    useIsIAMDelegationEnabled: queryMocks.useIsIAMDelegationEnabled,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('UserRow', () => {
  beforeEach(() => {
    queryMocks.useIsIAMDelegationEnabled.mockReturnValue({
      isIAMDelegationEnabled: true,
    });
  });

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

    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={user} />, {
        flags: {
          iamDelegation: { enabled: true },
        },
      })
    );

    expect(getByText(user.username)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();

    await waitFor(() => {
      expect(getByText('User')).toBeVisible();
    });
  });

  it('renders username and user type, and does not render email for a Delegate user when isIAMDelegationEnabled flag is enabled', async () => {
    const delegateUser = accountUserFactory.build({
      user_type: 'delegate',
    });

    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    const { getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(<UserRow onDelete={vi.fn()} user={delegateUser} />, {
        flags: {
          iamDelegation: { enabled: true },
        },
      })
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
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ timezone: 'utc' }),
    });

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
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ timezone: 'utc' }),
    });

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
