import * as account from '@linode/api-v4/lib/account/account';
import * as profile from '@linode/api-v4/lib/profile/profile';
import { waitFor, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { notificationFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { EmailBounceNotificationSection } from './EmailBounce';

const mockUpdateAccountInfo = jest.spyOn(account, 'updateAccountInfo');
const mockUpdateProfile = jest.spyOn(profile, 'updateProfile');

describe('EmailBounceNotificationSection', () => {
  it('renders an account email bounce notice', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <EmailBounceNotificationSection />,
      {
        customStore: {
          __resources: {
            notifications: {
              data: [
                notificationFactory.build({ type: 'billing_email_bounce' }),
              ],
            },
            account: {
              data: { email: 'account@example.com' } as any,
            },
          },
        },
      }
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

  it('renders an profile email bounce notice', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <EmailBounceNotificationSection />,
      {
        customStore: {
          __resources: {
            notifications: {
              data: [notificationFactory.build({ type: 'user_email_bounce' })],
            },
            profile: { data: { email: 'profile@example.com' } as any },
          },
        },
      }
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
