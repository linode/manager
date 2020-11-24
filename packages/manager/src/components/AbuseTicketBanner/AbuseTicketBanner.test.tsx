import { Notification } from '@linode/api-v4/lib/account/types';
import { render } from '@testing-library/react';
import * as React from 'react';

import {
  abuseTicketNotificationFactory,
  notificationFactory
} from 'src/factories/notification';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { AbuseTicketBanner } from './AbuseTicketBanner';

import filterAbuseTickets from 'src/store/selectors/getAbuseTicket';

const makeMockStore = (notifications: Notification[]) => {
  return {
    __resources: {
      notifications: {
        data: notifications
      }
    }
  };
};

describe('Abuse ticket banner', () => {
  it('should render a banner for an abuse ticket', () => {
    const { queryAllByText } = render(
      wrapWithTheme(<AbuseTicketBanner />, {
        customStore: makeMockStore(abuseTicketNotificationFactory.buildList(1))
      })
    );
    expect(queryAllByText(/an open abuse ticket/)).toHaveLength(1);
  });

  it('should aggregate multiple abuse tickets', () => {
    const { queryAllByText } = render(
      wrapWithTheme(<AbuseTicketBanner />, {
        customStore: makeMockStore(abuseTicketNotificationFactory.buildList(2))
      })
    );
    expect(queryAllByText(/2 open abuse tickets/)).toHaveLength(1);
  });

  it('should link to the ticket', () => {
    const mockAbuseTicket = abuseTicketNotificationFactory.build();
    const { getByTestId } = render(
      wrapWithTheme(<AbuseTicketBanner />, {
        customStore: makeMockStore([mockAbuseTicket])
      })
    );
    const link = getByTestId('abuse-ticket-link');
    expect(link).toHaveAttribute('href', mockAbuseTicket.entity!.url);
  });

  it('should return null if there are no abuse tickets', () => {
    const { queryByTestId } = render(wrapWithTheme(<AbuseTicketBanner />));

    expect(queryByTestId('abuse-ticket-link')).toBeNull();
  });

  describe('integration tests', () => {
    it('should filter out abuse ticket notifications from the store', () => {
      const mockNotification = notificationFactory.build();
      const abuseTicketNotification = abuseTicketNotificationFactory.build();
      const tickets = filterAbuseTickets({
        notifications: {
          data: [mockNotification, abuseTicketNotification]
        }
      } as any);
      expect(tickets[0].label).toMatch(/abuse/);
    });
  });
});
