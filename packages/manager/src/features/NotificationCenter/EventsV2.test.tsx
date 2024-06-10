import * as React from 'react';

import { eventFactory } from 'src/factories';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { EventsV2 } from './EventsV2';

import type { NotificationItem } from './NotificationSection';

const events = eventFactory.buildList(20);
const eventNotifications: NotificationItem[] = events.map((event) => ({
  body: event.message!,
  countInTotal: true,
  eventId: event.id,
  id: `event-${event.id}`,
  showProgress: false,
}));

describe('EventsV2', () => {
  it('should render', () => {
    resizeScreenSize(1600);

    const { getByText, getAllByTestId } = renderWithTheme(
      <EventsV2 eventNotifications={eventNotifications} />
    );

    expect(getByText('Events')).toBeInTheDocument();
    expect(getByText('View all events')).toBeInTheDocument();
    expect(getAllByTestId('notification-item')).toHaveLength(20);
  });
});
