// TODO eventMessagesV2: Do we need to handle unwanted taxId events
import * as React from 'react';

import { EVENT_POLLING_FILTER } from 'src/features/Events/constants';
import { formatProgressEvent } from 'src/features/Events/utils';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import { notificationContext as _notificationContext } from '../NotificationContext';
import { RenderEventV2 } from './RenderEventV2';

import type { NotificationItem } from '../NotificationSection';
import type { Event } from '@linode/api-v4';

export const useEventNotificationsV2 = () => {
  // `profile_update` is a noisy event
  // Any change to user preferences will trigger this event, so we filter it out at the API level
  const { events } = useEventsInfiniteQuery(EVENT_POLLING_FILTER);
  const notificationContext = React.useContext(_notificationContext);

  const formattedEvents = events?.map((event) => {
    const { showProgress } = formatProgressEvent(event);

    return formatEventForDisplay({
      event,
      onClose: notificationContext.closeMenu,
      showProgress,
    });
  });

  return formattedEvents?.filter((event) => Boolean(event.body)) ?? [];
};

interface FormattedEventForDisplay {
  event: Event;
  onClose: () => void;
  showProgress: boolean;
}

const formatEventForDisplay = ({
  event,
  onClose,
}: FormattedEventForDisplay): NotificationItem => ({
  body: <RenderEventV2 event={event} onClose={onClose} />,
  countInTotal: !event.seen,
  eventId: event.id,
  id: `event-${event.id}`,
  showProgress: formatProgressEvent(event).showProgress,
});
