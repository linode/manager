import type { Event } from '@linode/api-v4';
import type { NotificationItem } from 'src/features/NotificationCenter/NotificationSection.tsx';

type EventOrNotification = Event | NotificationItem;

/**
 * @deprecated This function is only used in the NotificationMenu (v1) component, which is deprecated.
 */
function isNotificationItem(
  item: EventOrNotification
): item is NotificationItem {
  return 'eventId' in item;
}

export const getHighestEventId = (events: EventOrNotification[]): number =>
  events.reduce((highestId, event) => {
    const id = isNotificationItem(event) ? event.eventId ?? 0 : event.id;
    return Math.max(highestId, id);
  }, 0);

// This is an optimization for the NotificationMenuV2 component since we know from the events which are unseen.
export const getHighestUnseenEventId = (events: Event[]): number =>
  events.reduce(
    (highestId, event) =>
      !event.seen ? Math.max(highestId, event.id) : highestId,
    0
  );
