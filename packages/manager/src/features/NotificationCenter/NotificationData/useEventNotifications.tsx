import { Event, EventAction } from '@linode/api-v4/lib/account/types';
import { partition } from 'ramda';
import * as React from 'react';
import useEvents from 'src/hooks/useEvents';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { NotificationItem } from '../NotificationSection';
import RenderEvent from './RenderEvent';
import RenderProgressEvent from './RenderProgressEvent';
import { notificationContext } from '../NotificationContext';

const unwantedEvents: EventAction[] = [
  'account_update',
  'account_settings_update',
  'credit_card_updated',
  'profile_update',
  'ticket_attachment_upload',
  'volume_update',
];

export const useEventNotifications = () => {
  const { events } = useEvents();
  const context = React.useContext(notificationContext);

  const _events = events.filter(
    thisEvent => !unwantedEvents.includes(thisEvent.action)
  );

  const [inProgress, completed] = partition<Event>(isInProgressEvent, _events);

  const allEvents = [
    ...inProgress.map(thisEvent =>
      formatProgressEventForDisplay(thisEvent, context.closeDrawer)
    ),
    ...completed.map(thisEvent =>
      formatEventForDisplay(thisEvent, context.closeDrawer)
    ),
  ];

  return allEvents.filter(thisAction =>
    Boolean(thisAction.body)
  ) as NotificationItem[];
};

const formatEventForDisplay = (
  event: ExtendedEvent,
  onClose: () => void
): NotificationItem => ({
  id: `event-${event.id}`,
  body: <RenderEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
});

const formatProgressEventForDisplay = (
  event: ExtendedEvent,
  onClose: () => void
): NotificationItem => ({
  id: `progress-event-${event.id}`,
  body: <RenderProgressEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
});

export default useEventNotifications;
