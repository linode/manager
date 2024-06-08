// TODO eventMessagesV2: Do we need to handle unwanted taxId events
import * as React from 'react';

import { EVENT_POLLING_FILTER } from 'src/features/Events/constants';
import { shouldShowEventProgress } from 'src/features/Events/utils';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import { notificationContext as _notificationContext } from '../NotificationContext';
import { RenderEventV2 } from './RenderEventV2';

import type { NotificationItem } from '../NotificationSection';
import type { Event } from '@linode/api-v4';

export const useEventNotificationsV2 = () => {
  // Profile_update is a noisy event
  // Any change to user preferences will trigger this event, so we filter it out at the API level
  const events = useEventsInfiniteQuery(EVENT_POLLING_FILTER).events;
  const notificationContext = React.useContext(_notificationContext);

  const formattedEvents = events?.map((event) =>
    formatEventForDisplay({
      event,
      isProgressEvent: shouldShowEventProgress(event),
      onClose: notificationContext.closeMenu,
    })
  );

  return formattedEvents?.filter((event) => Boolean(event.body)) ?? [];
};

interface FormattedEventForDisplay {
  event: Event;
  isProgressEvent: boolean;
  onClose: () => void;
}

const formatEventForDisplay = ({
  event,
  onClose,
}: FormattedEventForDisplay): NotificationItem => ({
  body: <RenderEventV2 event={event} onClose={onClose} />,
  countInTotal: !event.seen,
  eventId: event.id,
  id: `event-${event.id}`,
  isProgressEvent: shouldShowEventProgress(event),
});
