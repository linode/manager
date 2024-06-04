import { Event } from '@linode/api-v4/lib/account/types';
import * as React from 'react';

import { isInProgressEvent } from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import { notificationContext as _notificationContext } from '../NotificationContext';
import { RenderEventV2 } from './RenderEventV2';

import type { NotificationItem } from '../NotificationSection';

// const unwantedEvents: EventAction[] = [
//   'account_update',
//   'account_settings_update',
//   'credit_card_updated',
//   'profile_update',
//   'ticket_attachment_upload',
//   'volume_update',
// ];

export const useEventNotificationsV2 = () => {
  const events = useEventsInfiniteQuery().events;
  const notificationContext = React.useContext(_notificationContext);

  const formattedEvents = events?.map((event) =>
    formatEventForDisplay({
      event,
      isProgressEvent: isInProgressEvent(event),
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
  isProgressEvent,
  onClose,
}: FormattedEventForDisplay): NotificationItem => ({
  body: (
    <RenderEventV2
      event={event}
      isProgressEvent={isProgressEvent}
      onClose={onClose}
    />
  ),
  countInTotal: !event.seen,
  eventId: event.id,
  id: `event-${event.id}`,
});
