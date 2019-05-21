import * as React from 'react';
import { cleanup, render } from 'react-testing-library';

import {
  abuseTicketNotification,
  mockNotification
} from 'src/__data__/notifications';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import Component, { AbuseTicketBanner } from './AbuseTicketBanner';

const mockState = {
  __resources: {
    notifications: {
      data: [abuseTicketNotification, mockNotification]
    }
  }
};

jest.mock('src/store', () => ({
  default: {
    getState: () => mockState,
    subscribe: () => jest.fn(),
    dispatch: () => jest.fn()
  }
}));

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
    expect(AbuseTicketBanner({ abuseTickets: [] })).toBeNull();
  });

  describe('integration tests', () => {
    it('should filter out abuse ticket notifications from the store', () => {
      const { queryAllByText } = render(wrapWithTheme(<Component />));
      expect(queryAllByText(/abuse/)).toHaveLength(1);
    });
  });
});
