import { cleanup, render } from '@testing-library/react';
import * as React from 'react';

import {
  abuseTicketNotification,
  mockNotification
} from 'src/__data__/notifications';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { AbuseTicketBanner } from './AbuseTicketBanner';

import filterAbuseTickets from 'src/store/selectors/getAbuseTicket';

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

  describe('integration tests', () => {
    it('should filter out abuse ticket notifications from the store', () => {
      const tickets = filterAbuseTickets({
        notifications: {
          data: [mockNotification, abuseTicketNotification]
        }
      } as any);
      expect(tickets[0].label).toMatch(/abuse/);
    });
  });
});
