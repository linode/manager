import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDetailsPanel } from './UserDetailsPanel';

describe('UserDetailsPanel', () => {
  it("renders the user's username and email", async () => {
    const user = accountUserFactory.build();

    const { getByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    expect(getByText('Username')).toBeVisible();
    expect(getByText(user.username)).toBeVisible();

    expect(getByText('Email')).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });
  it("renders 'limited' if the user is restricted", async () => {
    const user = accountUserFactory.build({ restricted: true });

    const { getByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    expect(getByText('Account Access')).toBeVisible();
    expect(getByText('Limited')).toBeVisible();
  });
  it("renders 'full' if the user is unrestricted", async () => {
    const user = accountUserFactory.build({ restricted: false });

    const { getByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    expect(getByText('Account Access')).toBeVisible();
    expect(getByText('Full')).toBeVisible();
  });
  it("renders the user's phone number", async () => {
    const user = accountUserFactory.build({
      verified_phone_number: '+17040000000',
    });

    const { getByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    expect(getByText('Verified Phone Number')).toBeVisible();
    expect(getByText(user.verified_phone_number!)).toBeVisible();
  });
  it("renders the user's 2FA status", async () => {
    const user = accountUserFactory.build({ tfa_enabled: true });

    const { getByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    expect(getByText('2FA')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
  });
});
