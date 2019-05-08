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
  it('should render a banner for each abuse ticket', () => {
    const { rerender, queryAllByText } = render(
      wrapWithTheme(
        <AbuseTicketBanner abuseTickets={[abuseTicketNotification]} />
      )
    );
    expect(queryAllByText(/abuse/)).toHaveLength(1);
    rerender(
      wrapWithTheme(
        <AbuseTicketBanner
          abuseTickets={[abuseTicketNotification, abuseTicketNotification]}
        />
      )
    );
    expect(queryAllByText(/abuse/)).toHaveLength(2);
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
