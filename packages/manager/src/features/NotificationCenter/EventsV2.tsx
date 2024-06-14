import * as React from 'react';

import { NotificationSection } from './NotificationSection';

import type { NotificationItem } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20;

interface EventsV2Props {
  eventNotifications: NotificationItem[];
  onCloseNotificationCenter: () => void;
}

export const EventsV2 = ({
  eventNotifications,
  onCloseNotificationCenter,
}: EventsV2Props) => {
  return (
    <NotificationSection
      content={eventNotifications.slice(0, NUM_EVENTS_DISPLAY)}
      count={NUM_EVENTS_DISPLAY}
      emptyMessage="No recent events to display."
      header="Events"
      onCloseNotificationCenter={onCloseNotificationCenter}
      showMoreTarget="/events"
      showMoreText="View all events"
    />
  );
};
