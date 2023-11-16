import * as account from '@linode/api-v4/lib/account/account';
import * as profile from '@linode/api-v4/lib/profile/profile';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EmailBounceNotificationSection } from './EmailBounce';

const mockUpdateAccountInfo = vi.spyOn(account, 'updateAccountInfo');
const mockUpdateProfile = vi.spyOn(profile, 'updateProfile');

describe('EmailBounceNotificationSection', () => {
  it.skip('renders an account email bounce notice', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <EmailBounceNotificationSection />
    );
    // Notice is visible.
    getByTestId('billing_email_bounce');

    const confirmButton = getByTestId('confirmButton');
    fireEvent.click(confirmButton);

    // PUT /account is called with the account's email.
    expect(mockUpdateAccountInfo).toHaveBeenCalledWith({
      email: 'account@example.com',
    });

    // The Notice disappears.
    await waitFor(() =>
      expect(queryByTestId('billing_email_bounce')).not.toBeInTheDocument()
    );
  });

  it.skip('renders an profile email bounce notice', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <EmailBounceNotificationSection />
    );
    // Notice is visible.
    getByTestId('user_email_bounce');

    const confirmButton = getByTestId('confirmButton');
    fireEvent.click(confirmButton);

    // PUT /profile is called with the user's email.
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      email: 'profile@example.com',
    });

    // The Notice disappears.
    await waitFor(() =>
      expect(queryByTestId('user_email_bounce')).not.toBeInTheDocument()
    );
  });
});
