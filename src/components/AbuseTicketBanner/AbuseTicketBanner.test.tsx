import * as React from 'react';
import { cleanup, render } from 'react-testing-library';

import { abuseTicketNotification } from 'src/__data__/notifications';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { AbuseTicketBanner } from './AbuseTicketBanner';

afterEach(cleanup);

describe('Abuse ticket banner', () => {
  it('should render a banner for an abuse ticket', () => {
    const { queryAllByText } = render(
      wrapWithTheme(
        <AbuseTicketBanner abuseTickets={[abuseTicketNotification]} />
      )
    );
    expect(queryAllByText(/an open abuse ticket/)).toHaveLength(1);
  });

  it('should aggregate multiple abuse tickets', () => {
    const { queryAllByText } = render(
      wrapWithTheme(
        <AbuseTicketBanner
          abuseTickets={[abuseTicketNotification, abuseTicketNotification]}
        />
      )
    );
    expect(queryAllByText(/2 open abuse tickets/)).toHaveLength(1);
  });

  it('should link to the ticket', () => {
    const { getByTestId } = render(
      wrapWithTheme(
        <AbuseTicketBanner abuseTickets={[abuseTicketNotification]} />
      )
    );
    const link = getByTestId('abuse-ticket-link');
    expect(link).toHaveAttribute('href', abuseTicketNotification.entity!.url);
  });

  it('should return null if there are no abuse tickets', () => {
    const { queryByTestId } = render(
      wrapWithTheme(<AbuseTicketBanner abuseTickets={[]} />)
    );

    expect(queryByTestId('abuse-ticket-link')).toBeNull();
  });
});
