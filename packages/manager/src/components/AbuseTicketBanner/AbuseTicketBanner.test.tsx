import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  abuseTicketNotificationFactory,
  notificationFactory,
} from 'src/factories/notification';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { getAbuseTickets } from 'src/store/selectors/getAbuseTicket';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { AbuseTicketBanner } from './AbuseTicketBanner';

const TICKET_TESTID = 'abuse-ticket-link';

describe('Abuse ticket banner', () => {
  it('should render a banner for an abuse ticket', async () => {
    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(
          makeResourcePage(abuseTicketNotificationFactory.buildList(1))
        );
      })
    );
    const { queryAllByText } = renderWithTheme(<AbuseTicketBanner />);

    await waitFor(() => {
      expect(queryAllByText(/an open abuse ticket/)).toHaveLength(1);
    });
  });

  it('should aggregate multiple abuse tickets', async () => {
    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(
          makeResourcePage(abuseTicketNotificationFactory.buildList(2))
        );
      })
    );
    const { queryAllByText } = render(wrapWithTheme(<AbuseTicketBanner />));

    await waitFor(() => {
      expect(queryAllByText(/2 open abuse tickets/)).toHaveLength(1);
    });
  });

  it('should link to the ticket if there is a single abuse ticket', async () => {
    const mockAbuseTicket = abuseTicketNotificationFactory.build();
    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage([mockAbuseTicket]));
      })
    );
    const { getByTestId } = renderWithTheme(<AbuseTicketBanner />);

    await waitFor(() => {
      const link = getByTestId(TICKET_TESTID);
      expect(link).toHaveAttribute('href', mockAbuseTicket.entity!.url);
    });
  });

  it('should link to the ticket list view if there are multiple tickets', async () => {
    const mockAbuseTickets = abuseTicketNotificationFactory.buildList(2);
    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage(mockAbuseTickets));
      })
    );
    const { getByTestId } = renderWithTheme(<AbuseTicketBanner />);

    await waitFor(() => {
      const link = getByTestId(TICKET_TESTID);
      expect(link).toHaveAttribute('href', '/support/tickets');
    });
  });

  it('should return null if there are no abuse tickets', () => {
    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );
    const { queryByTestId } = renderWithTheme(<AbuseTicketBanner />);

    expect(queryByTestId(TICKET_TESTID)).toBeNull();
  });

  it('getAbuseTickets should filter out abuse ticket notifications from the store', () => {
    const mockNotification = notificationFactory.build();
    const abuseTicketNotification = abuseTicketNotificationFactory.build();
    const tickets = getAbuseTickets([
      mockNotification,
      abuseTicketNotification,
    ]);
    expect(tickets[0].label).toMatch(/abuse/);
  });
});
