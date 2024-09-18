import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import AccountActivationLanding from './AccountActivationLanding';

const openSupportTicket = 'Open a Support Ticket';

describe('AccountActivationLanding', () => {
  it('renders the AccountActivationLanding component', () => {
    const { getByText, queryByText } = renderWithTheme(
      <AccountActivationLanding />
    );

    expect(
      getByText('Your account is currently being reviewed.')
    ).toBeVisible();
    expect(
      getByText(
        /Thanks for signing up! You’ll receive an email from us once our review is complete, so hang tight. If you have questions during this process/
      )
    ).toBeVisible();
    expect(getByText(/please open a Support ticket/)).toBeVisible();
    expect(queryByText(openSupportTicket)).not.toBeInTheDocument();
  });

  it('toggles open the Support Ticket dialog', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <AccountActivationLanding />
    );

    expect(queryByText(openSupportTicket)).not.toBeInTheDocument();
    const supportButtonLink = getByText(/please open a Support ticket/);
    await userEvent.click(supportButtonLink);
    expect(getByText(openSupportTicket)).toBeVisible();
  });
});
